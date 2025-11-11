/**
 * @fileoverview CTA Decision Logic for Free Shipping Optimization
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This module determines the optimal Call-To-Action (CTA) for each menu in a diet
 * to help users achieve free shipping on one or more platforms by analyzing:
 * - Current shipping costs per platform (via PlatformSummary)
 * - Products in each menu and their platform distribution
 * - Nutrition satisfaction requirements
 * - Available product substitution options
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * KEY CONCEPTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Platform Summaries:
 * - freeShippingTarget: Platforms needing more products/qty (remainToFree > 0)
 * - alreadyFreeShipping: Platforms at free threshold (remainToFree < 0)
 * - Sorted by priority (targets: smallest remain first; free: most negative first)
 *
 * Step Price:
 * - Sum of (product price + SERVICE_PRICE) for products on a platform in ONE menu
 * - Used to calculate: requiredQty = ceil(remainToFree / stepPrice)
 *
 * Menu Constraints:
 * - Maximum menus per diet: MAX_MENU_COUNT (= MENU_NUM_LABEL.length = 10)
 * - Available slots: MAX_MENU_COUNT - totalMenuNum
 * - Quantity increases must fit within available slots
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DECISION FLOW (7 BRANCHES)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. No Platforms → AddProduct
 *    User has no products yet, needs to add first products
 *
 * 2. Single Platform → AddTargetSellerProduct | None
 *    - If already free or nutrition satisfied → None
 *    - Otherwise → AddTargetSellerProduct (add more products)
 *
 * 3. Multiple Platforms + Nutrition Not Satisfied → AddTargetSellerProduct
 *    Prioritize nutrition over shipping optimization
 *
 * 4. Multiple Platforms + Can Optimize with +1 or +2 Qty → AddQty
 *    - Check if adding 1-2 menus can free at least one platform
 *    - Must fit within available menu slots (constraint check)
 *    - Returns requiredQtyByPlatform: Record<platform, ceil(remain/step)>
 *
 * 5. All Platforms Free → None
 *    No optimization needed
 *
 * 6. Single Target Platform + Feasible Substitution → Change
 *    Generate switch plans and return with targetPlatforms + switchPlans
 *
 * 7. Multiple Target Platforms + Feasible Substitution → Change | None
 *    Generate switch plans; if any exist → Change, otherwise → None
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCT SUBSTITUTION STRATEGY (4 RULES)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Rule 1 & 2: Singleton Target Items (highest priority)
 * - Identify products from target platforms that appear only once in entire diet
 * - If found in current menu → remove and add from other platforms:
 *   • Multiple targets (2+): prefer other target platforms, fallback to already-free
 *   • Single target: prefer already-free platforms, fallback to same target
 * - Priority: already-free platforms (last = highest), targets (smallest remain first)
 *
 * Rule 3: Multi-Target Platform Swaps (no already-free available)
 * - If 2+ target platforms and no already-free platforms:
 *   → Allow swapping between different target platforms
 * - Priority: freeShippingTarget order (smallest remain first)
 *
 * Rule 4: Remove from Already-Free Platforms
 * - Remove products from already-free, add from target platforms
 * - Removal priority: first in alreadyFreeShipping = highest
 * - Constraint: removal must keep that platform still free
 * - Validation: newTotal = currentTotal - (price + SERVICE_PRICE) * qty
 *   → stillFree = thresholdBased ? newTotal >= threshold : shippingPrice === 0
 *
 * All Rules: Ensure nutrition status remains "satisfied" after substitution
 * Limited to MAX_SWITCH_CANDIDATES per product (currently Infinity)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXAMPLE SCENARIOS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Scenario A: Empty Diet
 * - Input: platformNum = 0
 * - Decision: AddProduct
 * - User Action: Add first products
 *
 * Scenario B: Single Platform, Close to Free Shipping
 * - Input: 1 platform, remainToFree = 5000₩, stepPrice = 3000₩
 * - Decision: AddQty (requiredQty = ceil(5000/3000) = 2)
 * - User Action: Increase menu quantity by 2
 *
 * Scenario C: Multiple Platforms, Singleton Target Item
 * - Input: Platform A (target), Platform B (free), menu has 1 product from A (only one in diet)
 * - Decision: Change with switchPlans
 * - Switch Plan: Remove A product → add from B (maintain free) or other targets
 * - User Action: Swap product to consolidate platforms
 *
 * Scenario D: Already-Free Platform with Removable Item
 * - Input: Platform A (target, need 5000₩), Platform B (free, total 35000₩, threshold 30000₩)
 * - Decision: Change with switchPlans
 * - Switch Plan: Remove 4000₩ product from B → add from A (B stays free: 31000₩ > 30000₩)
 * - User Action: Swap to help A reach free shipping without losing B
 *
 * @module ctaDecision
 */

import {
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import { SERVICE_PRICE_PER_PRODUCT, MENU_NUM_LABEL } from "@/shared/constants";
import { getNutrStatus } from "@/shared/utils/sumUp";
import { PlatformSummary } from "@/shared/utils/dietSummary";
import { IBaseLineData } from "@/shared/api/types/baseLine";

// ================================================================
// CONSTANTS
// ================================================================
const MAX_SWITCH_CANDIDATES = Infinity;
const MAX_MENU_COUNT = MENU_NUM_LABEL.length;

// ================================================================
// TYPE DEFINITIONS
// ================================================================

/**
 * CTA recommendation types for achieving free shipping.
 */
export type CtaType =
  | "None"
  | "AddProduct"
  | "AddTargetSellerProduct"
  | "AddQty"
  | "Change";

/**
 * Input context for CTA decision making.
 */
export interface CtaDecisionInput {
  // Platform shipping summaries (sorted by priority)
  /** Platforms that need more products/quantity to reach free shipping (changedRemainToFree > 0) */
  freeShippingTarget: PlatformSummary[];
  /** Platforms already at free shipping threshold (changedRemainToFree < 0, most negative first) */
  alreadyFreeShipping: PlatformSummary[];

  // Current menu context
  /** The diet number of the menu being analyzed */
  currentMenuDietNo: string;
  /** Products in the current menu being analyzed */
  currentMenuProducts: IDietDetailProductData[];
  /** Client-side overridden quantities per menu (from Redux bottomSheet.bsData.dietQtyMap) */
  dietQtyMap: Record<string, number>;
  originalDietQtyMap: Record<string, number>;

  // Nutrition context
  /** Current nutrition satisfaction status for the whole diet */
  nutrStatus: "error" | "empty" | "notEnough" | "satisfied" | "exceed";
  /** User's baseline nutrition requirements */
  baseLine: IBaseLineData | undefined;

  // Whole diet and catalog
  /** Complete diet data with all menus and products */
  dTOData: IDietTotalObjData | undefined;
  /** All available products that can be used in diet */
  totalFoodList: IProductData[];
  /** Current total number of menus in the diet (used to check against MAX_MENU_COUNT) */
  totalMenuNum: number;
}

type SwitchPlan = {
  remove: IDietDetailProductData;
  addCandidates: IProductData[];
  /** Unique platform names from addCandidates, sorted by priority */
  platforms: string[];
};

export type SwitchPlanPerMenu = Record<string, SwitchPlan>; // productNo → SwitchPlan

/**
 * Discriminated union representing CTA decisions with type-specific details.
 * Each decision type carries relevant data for the UI to display recommendations.
 */
export type CtaDecisionDetail =
  | {
      type: "AddProduct";
      ctaBtnText: string;
    }
  | {
      type: "AddTargetSellerProduct";
      targetPlatforms: string[];
      ctaBtnText: string;
    }
  | {
      type: "AddQty";
      ctaBtnText: string;
      /** Required quantity increase per platform: ceil(remainToFree / stepPrice) */
      requiredQty: number;
    }
  | {
      type: "Change";
      ctaBtnText: string;
      /** Pre-computed switch plans for the current menu */
      switchPlan: SwitchPlanPerMenu;
    }
  | {
      type: "None";
      ctaBtnText: string;
    };

// ================================================================
// MAIN CTA DECISION LOGIC
// ================================================================

/**
 * Shared context used across all CTA decision computations.
 * Precomputed once to avoid redundant scans of diet data.
 */
interface SharedCtaContext {
  targetPlatforms: string[];
  alreadyFreePlatforms: string[];
  platformCounts: Record<string, number>; // Count of items per target platform across whole diet
  policyByPlatform: Record<
    string,
    {
      shippingPrice: number;
      freeShippingPrice: number;
      thresholdBasedFree: boolean;
      changedTotalPrice: number;
    }
  >;
  targetPriority: Record<string, number>; // Higher = better (smaller remain first)
  alreadyFreePriority: Record<string, number>; // Higher = better (last = highest)
}

/**
 * Per-menu context for CTA decision making.
 */
interface MenuCtaContext {
  dietNo: string;
  menu: IDietDetailProductData[];
  menuQty: number;
  originalMenuQty: number;
  nutrStatus: "error" | "empty" | "notEnough" | "satisfied" | "exceed";
}

/**
 * Determines CTA decisions for all menus in a diet.
 *
 * This is a single-pass function that:
 * 1. Precomputes shared context once (platform counts, policies, priorities)
 * 2. Iterates each menu and determines its CTA decision
 * 3. Returns a complete mapping of dietNo → CTA decision
 *
 * @param args - Context including diet data, platform summaries, and nutrition info
 * @returns Record mapping dietNo → CtaDecisionDetail for each menu
 */
export function determineCtaTypesForAllMenus(args: {
  dTOData: IDietTotalObjData;
  freeShippingTarget: PlatformSummary[];
  alreadyFreeShipping: PlatformSummary[];
  dietQtyMap: Record<string, number>;
  originalDietQtyMap: Record<string, number>;
  baseLine: IBaseLineData;
  totalFoodList: IProductData[];
  totalMenuNum: number;
}): Record<string, CtaDecisionDetail> {
  const {
    dTOData,
    freeShippingTarget,
    alreadyFreeShipping,
    dietQtyMap,
    originalDietQtyMap,
    baseLine,
    totalFoodList,
    totalMenuNum,
  } = args;

  // Step 1: Precompute shared context once
  const sharedContext = buildSharedContext({
    dTOData,
    freeShippingTarget,
    alreadyFreeShipping,
    dietQtyMap,
  });

  // Step 2: Process each menu
  const decisions: Record<string, CtaDecisionDetail> = {};

  for (const dietNo of Object.keys(dTOData)) {
    const menu = dTOData[dietNo]?.dietDetail || [];
    const { menuQty, originalMenuQty } = getMenuQty(
      menu,
      dietQtyMap,
      originalDietQtyMap,
      dietNo
    );

    const nutrStatus = getNutrStatus({
      totalFoodList,
      bLData: baseLine,
      dDData: menu,
    });

    const menuContext: MenuCtaContext = {
      dietNo,
      menu,
      menuQty,
      originalMenuQty,
      nutrStatus,
    };

    const decision = determineCtaForSingleMenu({
      menuContext,
      sharedContext,
      freeShippingTarget,
      alreadyFreeShipping,
      baseLine,
      totalFoodList,
      totalMenuNum,
    });

    decisions[dietNo] = decision;
  }

  return decisions;
}

/**
 * Builds shared context that is used across all menu CTA decisions.
 * This avoids redundant scans of diet data.
 */
function buildSharedContext(args: {
  dTOData: IDietTotalObjData;
  freeShippingTarget: PlatformSummary[];
  alreadyFreeShipping: PlatformSummary[];
  dietQtyMap: Record<string, number>;
}): SharedCtaContext {
  const { dTOData, freeShippingTarget, alreadyFreeShipping, dietQtyMap } = args;

  const targetPlatforms = freeShippingTarget.map((t) => t.platformNm);
  const alreadyFreePlatforms = alreadyFreeShipping.map((s) => s.platformNm);

  // Count items per target platform across the whole diet (for singleton detection)
  const platformCounts: Record<string, number> = {};
  for (const dietNo of Object.keys(dTOData)) {
    const detail = dTOData[dietNo]?.dietDetail || [];
    for (const p of detail) {
      if (targetPlatforms.includes(p.platformNm)) {
        platformCounts[p.platformNm] = (platformCounts[p.platformNm] || 0) + 1;
      }
    }
  }

  // Build shipping policy per platform
  const policyByPlatform = buildPlatformPolicyFromDiet(dTOData, dietQtyMap);

  // Build priority maps
  const targetPriority: Record<string, number> = {};
  freeShippingTarget.forEach((t, idx) => {
    targetPriority[t.platformNm] = freeShippingTarget.length - idx;
  });

  const alreadyFreePriority: Record<string, number> = {};
  alreadyFreePlatforms.forEach((platformName, idx, arr) => {
    alreadyFreePriority[platformName] = arr.length - 1 - idx;
  });

  return {
    targetPlatforms,
    alreadyFreePlatforms,
    platformCounts,
    policyByPlatform,
    targetPriority,
    alreadyFreePriority,
  };
}

/**
 * Determines the CTA decision for a single menu.
 * Follows the 7-branch decision tree documented in the file header.
 */
function determineCtaForSingleMenu(args: {
  menuContext: MenuCtaContext;
  sharedContext: SharedCtaContext;
  freeShippingTarget: PlatformSummary[];
  alreadyFreeShipping: PlatformSummary[];
  baseLine: IBaseLineData;
  totalFoodList: IProductData[];
  totalMenuNum: number;
}): CtaDecisionDetail {
  const {
    menuContext,
    sharedContext,
    freeShippingTarget,
    alreadyFreeShipping,
    baseLine,
    totalFoodList,
    totalMenuNum,
  } = args;

  const { dietNo, menu, menuQty, originalMenuQty, nutrStatus } = menuContext;
  const { targetPlatforms, alreadyFreePlatforms } = sharedContext;

  const totalPlatformCount =
    targetPlatforms.length + alreadyFreePlatforms.length;

  // Branch 1: No platforms
  if (totalPlatformCount === 0) {
    return { type: "AddProduct", ctaBtnText: `식품을 담아보세요` };
  }

  // Branch 2: Single platform
  if (totalPlatformCount === 1) {
    return decideSinglePlatform({
      isAlreadyFree: alreadyFreePlatforms.length === 1,
      nutrStatus,
      targetPlatforms,
    });
  }

  // Branch 3: Multiple platforms, nutrition not satisfied
  if (nutrStatus !== "satisfied") {
    return {
      type: "AddTargetSellerProduct",
      targetPlatforms,
      ctaBtnText: `${targetPlatforms[0]} 식품 더 담고 배송비 줄이기`,
    };
  }

  // Branch 4: Try quantity optimization
  const qtyDecision = tryQuantityOptimization({
    menu,
    freeShippingTarget,
    originalMenuQty,
    totalMenuNum,
  });
  if (qtyDecision) {
    return qtyDecision;
  }

  // Branch 5: All platforms already free
  if (targetPlatforms.length === 0) {
    return { type: "None", ctaBtnText: `` };
  }

  // Branch 6 & 7: Try product substitution
  const switchPlan = generateSwitchPlan({
    menuContext,
    sharedContext,
    baseLine,
    totalFoodList,
  });

  if (Object.keys(switchPlan).length > 0) {
    return {
      type: "Change",
      ctaBtnText: `식품 교체하고 배송비 줄이기`,
      switchPlan,
    };
  }

  return { type: "None", ctaBtnText: `` };
}

/**
 * Branch 2: Decide CTA for single platform scenario.
 */
function decideSinglePlatform(args: {
  isAlreadyFree: boolean;
  nutrStatus: string;
  targetPlatforms: string[];
}): CtaDecisionDetail {
  const { isAlreadyFree, nutrStatus, targetPlatforms } = args;

  if (isAlreadyFree || nutrStatus === "satisfied") {
    return { type: "None", ctaBtnText: `` };
  }

  return {
    type: "AddTargetSellerProduct",
    targetPlatforms,
    ctaBtnText: `${targetPlatforms[0]} 식품 더 담고 배송비 줄이기`,
  };
}

/**
 * Branch 4: Try quantity-only optimization (+1 or +2 menus).
 * Returns AddQty decision if feasible, otherwise undefined.
 */
function tryQuantityOptimization(args: {
  menu: IDietDetailProductData[];
  freeShippingTarget: PlatformSummary[];
  originalMenuQty: number;
  totalMenuNum: number;
}): CtaDecisionDetail | undefined {
  const { menu, freeShippingTarget, originalMenuQty, totalMenuNum } = args;

  if (menu.length === 0) return undefined;

  const availableQty = MAX_MENU_COUNT - totalMenuNum;
  if (availableQty <= 0) return undefined;
  if (originalMenuQty > 2) return undefined;

  const stepPriceByPlatform = getStepPriceByPlatform(menu);
  const requiredQtyByPlatform: Record<string, number> = {};
  for (const target of freeShippingTarget) {
    const step = stepPriceByPlatform[target.platformNm] || 0;
    if (step <= 0) continue;

    const qtyNeeded = Math.ceil(target.originalRemainToFree / step);
    if (qtyNeeded > 0 && qtyNeeded <= availableQty) {
      requiredQtyByPlatform[target.platformNm] = qtyNeeded;
    }
  }
  let requiredQtyArr = Object.values(requiredQtyByPlatform);
  const minQty = Math.min(...requiredQtyArr);
  const canOptimize = minQty >= 1 && minQty <= Math.min(2, availableQty);

  if (canOptimize) {
    return {
      type: "AddQty",
      ctaBtnText: `같은 근 ${minQty}개 더 추가해서 배송비 줄이기`,
      requiredQty: minQty,
    };
  }

  return undefined;
}

/**
 * Branch 6 & 7: Generate product substitution plans.
 * Applies rules in priority order: singleton items → multi-target swaps → already-free removal.
 */
function generateSwitchPlan(args: {
  menuContext: MenuCtaContext;
  sharedContext: SharedCtaContext;
  baseLine: IBaseLineData;
  totalFoodList: IProductData[];
}): SwitchPlanPerMenu {
  const { menuContext, sharedContext, baseLine, totalFoodList } = args;
  const { dietNo, menu, menuQty } = menuContext;
  const {
    targetPlatforms,
    alreadyFreePlatforms,
    platformCounts,
    policyByPlatform,
    targetPriority,
    alreadyFreePriority,
  } = sharedContext;

  // Helper: Check if swap maintains nutrition satisfaction
  const isNutritionSatisfiedAfterSwap = (
    currentProduct: IDietDetailProductData,
    candidateProduct: IProductData
  ): boolean => {
    const menuAfterSwap = menu
      .filter((p) => p.productNo !== currentProduct.productNo)
      .concat({
        ...(candidateProduct as any),
        qty: String(menuQty),
        dietNo,
        dietSeq: "",
        statusCd: "",
        statusNm: "",
      });

    const status = getNutrStatus({
      totalFoodList,
      bLData: baseLine,
      dDData: menuAfterSwap,
    });

    return status === "satisfied";
  };

  // Rule 1 & 2: Singleton target items (highest priority)
  const singletonPlans = generateSingletonItemPlans({
    menu,
    targetPlatforms,
    alreadyFreePlatforms,
    platformCounts,
    targetPriority,
    alreadyFreePriority,
    totalFoodList,
    isNutritionSatisfiedAfterSwap,
  });

  if (Object.keys(singletonPlans).length > 0) {
    return singletonPlans;
  }

  // Rule 3: Multi-target swaps (when no already-free platforms)
  if (targetPlatforms.length >= 2 && alreadyFreePlatforms.length === 0) {
    return generateMultiTargetSwapPlans({
      menu,
      targetPlatforms,
      targetPriority,
      totalFoodList,
      isNutritionSatisfiedAfterSwap,
    });
  }

  // Rule 4: Remove from already-free platforms
  return generateAlreadyFreeRemovalPlans({
    menu,
    menuQty,
    targetPlatforms,
    alreadyFreePlatforms,
    alreadyFreePriority,
    policyByPlatform,
    totalFoodList,
    isNutritionSatisfiedAfterSwap,
  });
}

/**
 * Rule 1 & 2: Generate plans for singleton target items.
 * These are products from target platforms that appear only once across the entire diet.
 */
function generateSingletonItemPlans(args: {
  menu: IDietDetailProductData[];
  targetPlatforms: string[];
  alreadyFreePlatforms: string[];
  platformCounts: Record<string, number>;
  targetPriority: Record<string, number>;
  alreadyFreePriority: Record<string, number>;
  totalFoodList: IProductData[];
  isNutritionSatisfiedAfterSwap: (
    cur: IDietDetailProductData,
    cand: IProductData
  ) => boolean;
}): SwitchPlanPerMenu {
  const {
    menu,
    targetPlatforms,
    alreadyFreePlatforms,
    platformCounts,
    targetPriority,
    alreadyFreePriority,
    totalFoodList,
    isNutritionSatisfiedAfterSwap,
  } = args;

  const singletonPlatforms = targetPlatforms.filter(
    (platform) => platformCounts[platform] === 1
  );

  const singletonItems = menu.filter((product) =>
    singletonPlatforms.includes(product.platformNm)
  );

  if (singletonItems.length === 0) {
    return {};
  }

  const plans: SwitchPlanPerMenu = {};

  // Build sorted candidate pools
  const sortedAlreadyFreePool = totalFoodList
    .filter((f) => alreadyFreePlatforms.includes(f.platformNm))
    .sort(
      (a, b) =>
        (alreadyFreePriority[b.platformNm] || 0) -
        (alreadyFreePriority[a.platformNm] || 0)
    );

  const sortedTargetPoolAll = totalFoodList
    .filter((f) => targetPlatforms.includes(f.platformNm))
    .sort(
      (a, b) =>
        (targetPriority[b.platformNm] || 0) -
        (targetPriority[a.platformNm] || 0)
    );

  const hasMultipleTargets = targetPlatforms.length >= 2;

  for (const singletonItem of singletonItems) {
    // Exclude same platform as the item being removed
    const sortedTargetPool = sortedTargetPoolAll.filter(
      (f) => f.platformNm !== singletonItem.platformNm
    );

    // Choose primary pool based on strategy
    let candidatePool = hasMultipleTargets
      ? sortedTargetPool // Multi-target: prefer other targets
      : sortedAlreadyFreePool; // Single target: prefer already-free

    // Fallback to alternate pool if primary is empty
    if (candidatePool.length === 0) {
      candidatePool = hasMultipleTargets
        ? sortedAlreadyFreePool
        : sortedTargetPool;
    }

    const candidates = findValidCandidates({
      productToRemove: singletonItem,
      candidatePool,
      isNutritionSatisfiedAfterSwap,
      maxCandidates: MAX_SWITCH_CANDIDATES,
    });

    if (candidates.length > 0) {
      const platforms = Array.from(
        new Set(candidates.map((c) => c.platformNm))
      );
      plans[singletonItem.productNo] = {
        remove: singletonItem,
        addCandidates: candidates,
        platforms,
      };
    }
  }

  return plans;
}

/**
 * Rule 3: Generate plans for multi-target platform swaps.
 * Used when 2+ target platforms exist and no already-free platforms.
 */
function generateMultiTargetSwapPlans(args: {
  menu: IDietDetailProductData[];
  targetPlatforms: string[];
  targetPriority: Record<string, number>;
  totalFoodList: IProductData[];
  isNutritionSatisfiedAfterSwap: (
    cur: IDietDetailProductData,
    cand: IProductData
  ) => boolean;
}): SwitchPlanPerMenu {
  const {
    menu,
    targetPlatforms,
    targetPriority,
    totalFoodList,
    isNutritionSatisfiedAfterSwap,
  } = args;

  const plans: SwitchPlanPerMenu = {};

  for (const currentProduct of menu) {
    if (!targetPlatforms.includes(currentProduct.platformNm)) continue;

    // Candidates from other target platforms (exclude same platform)
    const candidatePool = totalFoodList
      .filter(
        (f) =>
          targetPlatforms.includes(f.platformNm) &&
          f.platformNm !== currentProduct.platformNm
      )
      .sort(
        (a, b) =>
          (targetPriority[b.platformNm] || 0) -
          (targetPriority[a.platformNm] || 0)
      );

    const candidates = findValidCandidates({
      productToRemove: currentProduct,
      candidatePool,
      isNutritionSatisfiedAfterSwap,
      maxCandidates: MAX_SWITCH_CANDIDATES,
    });

    if (candidates.length > 0) {
      const platforms = Array.from(
        new Set(candidates.map((c) => c.platformNm))
      );
      plans[currentProduct.productNo] = {
        remove: currentProduct,
        addCandidates: candidates,
        platforms,
      };
    }
  }

  return plans;
}

/**
 * Rule 4: Generate plans for removing from already-free platforms.
 * Ensures the platform stays free after removal.
 */
function generateAlreadyFreeRemovalPlans(args: {
  menu: IDietDetailProductData[];
  menuQty: number;
  targetPlatforms: string[];
  alreadyFreePlatforms: string[];
  alreadyFreePriority: Record<string, number>;
  policyByPlatform: SharedCtaContext["policyByPlatform"];
  totalFoodList: IProductData[];
  isNutritionSatisfiedAfterSwap: (
    cur: IDietDetailProductData,
    cand: IProductData
  ) => boolean;
}): SwitchPlanPerMenu {
  const {
    menu,
    menuQty,
    targetPlatforms,
    alreadyFreePlatforms,
    alreadyFreePriority,
    policyByPlatform,
    totalFoodList,
    isNutritionSatisfiedAfterSwap,
  } = args;

  const plans: SwitchPlanPerMenu = {};

  // Sort products by removal priority
  const productsToConsider = menu
    .filter((p) => alreadyFreePlatforms.includes(p.platformNm))
    .sort(
      (a, b) =>
        (alreadyFreePriority[b.platformNm] || 0) -
        (alreadyFreePriority[a.platformNm] || 0)
    );

  const candidatePool = totalFoodList.filter((f) =>
    targetPlatforms.includes(f.platformNm)
  );

  for (const currentProduct of productsToConsider) {
    // Check if removal keeps platform free
    const policy = policyByPlatform[currentProduct.platformNm];
    if (!policy) continue;

    const pricePerUnit =
      (parseInt(currentProduct.price, 10) || 0) + SERVICE_PRICE_PER_PRODUCT;
    const totalAfterRemoval =
      (policy.changedTotalPrice || 0) - pricePerUnit * menuQty;

    const stillFree = policy.thresholdBasedFree
      ? totalAfterRemoval >= policy.freeShippingPrice
      : policy.shippingPrice === 0;

    if (!stillFree) continue;

    const candidates = findValidCandidates({
      productToRemove: currentProduct,
      candidatePool,
      isNutritionSatisfiedAfterSwap,
      maxCandidates: MAX_SWITCH_CANDIDATES,
    });

    if (candidates.length > 0) {
      const platforms = Array.from(
        new Set(candidates.map((c) => c.platformNm))
      );
      plans[currentProduct.productNo] = {
        remove: currentProduct,
        addCandidates: candidates,
        platforms,
      };
    }
  }

  return plans;
}

/**
 * Finds valid replacement candidates for a product.
 * Filters out the same product and validates nutrition satisfaction.
 */
function findValidCandidates(args: {
  productToRemove: IDietDetailProductData;
  candidatePool: IProductData[];
  isNutritionSatisfiedAfterSwap: (
    cur: IDietDetailProductData,
    cand: IProductData
  ) => boolean;
  maxCandidates: number;
}): IProductData[] {
  const {
    productToRemove,
    candidatePool,
    isNutritionSatisfiedAfterSwap,
    maxCandidates,
  } = args;

  const validCandidates: IProductData[] = [];

  for (const candidate of candidatePool) {
    if (candidate.productNo === productToRemove.productNo) continue;

    if (isNutritionSatisfiedAfterSwap(productToRemove, candidate)) {
      validCandidates.push(candidate);
    }

    if (validCandidates.length >= maxCandidates) break;
  }

  return validCandidates;
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Extracts the quantity for a menu.
 * Priority: dietQtyMap (client override) > menu[0].qty (server data) > default 1
 *
 * @param menu - Products in the menu
 * @param dietQtyMap - Client-side quantity overrides
 * @param dietNo - Diet number to look up in dietQtyMap
 * @returns Menu quantity (minimum 1)
 */
function getMenuQty(
  menu: IDietDetailProductData[],
  dietQtyMap: Record<string, number>,
  originalDietQtyMap: Record<string, number>,
  currentDietNo: string
) {
  const qtyFromServer = menu?.[0]?.qty ? parseInt(menu[0].qty, 10) : 1;

  return {
    menuQty: dietQtyMap?.[currentDietNo] || qtyFromServer,
    originalMenuQty: originalDietQtyMap?.[currentDietNo] || qtyFromServer,
  };
}

/**
 * Calculates the step price (price contribution) per platform for a menu.
 * Step price = sum of (product price + SERVICE_PRICE_PER_PRODUCT) for all products on that platform.
 *
 * This is used to calculate how much adding one more menu contributes to each platform's total.
 *
 * @param menu - Products in the menu
 * @returns Record mapping platform name → total step price
 */
function getStepPriceByPlatform(
  menu: IDietDetailProductData[]
): Record<string, number> {
  const by: Record<string, number> = {};
  for (const p of menu) {
    const platform = p.platformNm;
    const priceUnit = (parseInt(p.price, 10) || 0) + SERVICE_PRICE_PER_PRODUCT;
    by[platform] = (by[platform] || 0) + priceUnit;
  }
  return by;
}

/**
 * Builds a platform shipping policy lookup from the complete diet data.
 *
 * For each platform:
 * - Extracts shipping policy (shippingPrice, freeShippingPrice, freeShippingYn)
 * - Computes current total price across all menus
 *
 * Used to validate that removing products from already-free platforms keeps them free.
 *
 * @param dTOData - Complete diet data with all menus and products
 * @param dietQtyMap - Client-side quantity overrides
 * @returns Record mapping platform → {policy, changedTotalPrice}
 */
function buildPlatformPolicyFromDiet(
  dTOData: IDietTotalObjData | undefined,
  dietQtyMap: Record<string, number>
): Record<
  string,
  {
    shippingPrice: number;
    freeShippingPrice: number;
    thresholdBasedFree: boolean;
    changedTotalPrice: number; // approximate total per platform (recomputed here)
  }
> {
  const out: Record<string, any> = {};
  if (!dTOData) return out;

  // accumulate totals per platform and remember a sample product for policy
  const sample: Record<string, IDietDetailProductData> = {};
  const totals: Record<string, number> = {};

  for (const dietNo of Object.keys(dTOData)) {
    const detail = dTOData[dietNo]?.dietDetail || [];
    const qty = dietQtyMap?.[dietNo]
      ? dietQtyMap[dietNo]
      : detail?.[0]?.qty
      ? parseInt(detail[0].qty, 10)
      : 1;
    for (const p of detail) {
      const unit = (parseInt(p.price, 10) || 0) + SERVICE_PRICE_PER_PRODUCT;
      totals[p.platformNm] = (totals[p.platformNm] || 0) + unit * qty;
      if (!sample[p.platformNm]) sample[p.platformNm] = p;
    }
  }

  for (const platform of Object.keys(sample)) {
    const s = sample[platform];
    const shippingPrice = parseInt(s.shippingPrice, 10) || 0;
    const freeShippingPrice = parseInt(s.freeShippingPrice, 10);
    const thresholdBasedFree =
      String(s.freeShippingYn || "N").toUpperCase() === "Y";
    out[platform] = {
      shippingPrice,
      freeShippingPrice: Number.isFinite(freeShippingPrice)
        ? freeShippingPrice
        : Infinity,
      thresholdBasedFree,
      changedTotalPrice: totals[platform] || 0,
    };
  }
  return out;
}
