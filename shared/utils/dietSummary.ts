import {
  IDietDetailData,
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import {
  MENU_KIND_LABEL,
  MENU_NUM_LABEL,
  SERVICE_PRICE_PER_PRODUCT,
} from "../constants";
import { IProductData } from "../api/types/product";

export interface PlatformSummary {
  platformNm: string;
  originalTotalPrice: number;
  changedTotalPrice: number;
  originalShippingPrice: number;
  changedShippingPrice: number;
  originalRemainToFree: number;
  changedRemainToFree: number;
  hasChanges: boolean;
  removed?: boolean; // true when platform has no items after changes (deleted scenario)
}

function toNumber(n: string | number | undefined | null, def = 0): number {
  if (typeof n === "number") return isNaN(n) ? def : n;
  if (typeof n === "string") {
    const v = parseFloat(n.replace(/,/g, ""));
    return isNaN(v) ? def : v;
  }
  return def;
}

function pickPlatformPolicy(items: IDietDetailProductData[]) {
  // Assume platform-level policy is consistent; use the first item's values.
  const first = items[0];
  const shippingPrice = toNumber(first?.shippingPrice, 0);
  const freeShippingPrice = toNumber(first?.freeShippingPrice, Infinity);
  // Per requirements:
  // freeShippingYn === 'N' -> shipping is always charged (no free threshold)
  // freeShippingYn === 'Y' -> free if total >= freeShippingPrice
  const yn = String(first?.freeShippingYn || "N").toUpperCase();
  const thresholdBasedFree = yn === "Y";
  return { shippingPrice, freeShippingPrice, thresholdBasedFree };
}

export interface FoodChange {
  delete?: IDietDetailProductData; // product to delete
  add?: IProductData; // product to add
}

/**
 * Computes platform summaries for the user's diet cart.
 * @param dTOData - Diet data from server
 * @param dietQtyMap - Optional: map of dietNo to new qty (if not provided, use product qty)
 * @param foodChangeMap - Optional: map of dietNo to {delete, add} food change
 */
export function getPlatformSummaries(
  dTOData: IDietTotalObjData | undefined,
  dietQtyMap?: Record<string, number>,
  foodChangeMap?: Record<string, FoodChange>
): PlatformSummary[] {
  // If no data and no food changes, return empty
  if (!dTOData && !foodChangeMap) return [];

  // Group items by platformNm
  const byPlatform: Record<string, IDietDetailProductData[]> = {};

  // Add existing items from dTOData if available
  if (dTOData) {
    Object.values(dTOData).forEach(({ dietNo, dietDetail }) => {
      (dietDetail || []).forEach((item) => {
        const platform = item.platformNm || "";
        if (!byPlatform[platform]) byPlatform[platform] = [];
        byPlatform[platform].push(item);
      });
    });
  }

  // Handle food changes to ensure platforms exist in byPlatform
  if (foodChangeMap) {
    Object.entries(foodChangeMap).forEach(([dietNo, change]) => {
      if (change.add) {
        const platform = change.add.platformNm || "";
        // Just ensure the platform exists, don't add items yet
        // Items will be added in the changedItems processing below
        if (!byPlatform[platform]) byPlatform[platform] = [];
      }
    });
  }

  const platformEntries = Object.entries(byPlatform);
  const summaries: PlatformSummary[] = platformEntries.map(
    ([platformNm, items]) => {
      // Filter out items that were only added via foodChangeMap for original calculation
      const originalItems = dTOData
        ? items.filter((item) => {
            // Check if this item exists in the original dTOData
            if (!dTOData) return false;
            return Object.values(dTOData).some(({ dietDetail }) =>
              dietDetail?.some(
                (originalItem) => originalItem.productNo === item.productNo
              )
            );
          })
        : [];

      // --- Original total: only use items that existed in dTOData ---
      let originalTotal = 0;
      originalItems.forEach((item) => {
        const price = toNumber(item.price, 0) + SERVICE_PRICE_PER_PRODUCT;
        const productQty = toNumber(item.qty, 1);
        originalTotal += price * productQty;
      });

      // --- Changed total: apply dietQtyMap and foodChangeMap if present ---
      let changedTotal = 0;
      // 1. Start with original items
      let changedItems = [...originalItems];

      // 2. Apply food changes
      if (foodChangeMap) {
        Object.entries(foodChangeMap).forEach(([dietNo, change]) => {
          // apply only both delete and add exist
          if (change.delete && change.add) {
            // Remove item if delete is specified
            changedItems = changedItems.filter(
              (it) =>
                it.dietNo !== dietNo ||
                it.productNo !== change.delete?.productNo
            );

            // Add item if add is specified (only to the target platform)
            if (change.add.platformNm === platformNm) {
              const currentDietQty = dietQtyMap?.[dietNo]
                ? String(dietQtyMap[dietNo])
                : dTOData?.[dietNo]?.dietDetail[0]?.qty || "1";
              changedItems.push({
                ...change.add,
                dietNo,
                qty: currentDietQty,
                dietSeq: "",
                statusCd: "",
                statusNm: "",
              });
            }
          }
        });
      }
      // 3. Apply qty changes if present
      // dietQtyMap now only contains CHANGED menu quantities
      // If dietQtyMap is undefined or empty, no changes
      changedItems.forEach((item) => {
        const price = toNumber(item.price, 0) + SERVICE_PRICE_PER_PRODUCT;
        const productQty = toNumber(item.qty, 1);

        // If this diet's quantity changed, apply it
        // dietQtyMap[dietNo] represents the new total quantity for that menu
        if (dietQtyMap && item.dietNo in dietQtyMap) {
          const newMenuQty = dietQtyMap[item.dietNo];
          const originalMenuQty = toNumber(item.qty, 1);
          const multiplier = newMenuQty / originalMenuQty;
          changedTotal += price * productQty * multiplier;
        } else {
          changedTotal += price * productQty;
        }
      });

      // Use changed items if no original items (for policy calculation)
      const policyItems =
        originalItems.length > 0 ? originalItems : changedItems;
      const { shippingPrice, freeShippingPrice, thresholdBasedFree } =
        pickPlatformPolicy(policyItems);

      // Original shipping (follow policy)
      const originalFree =
        thresholdBasedFree && originalTotal >= freeShippingPrice;
      const originalShip = originalFree ? 0 : shippingPrice;
      // Remain can be negative if total exceeds freeShippingPrice
      const originalRemain = thresholdBasedFree
        ? freeShippingPrice - originalTotal
        : 0; // No free threshold when policy is 'N'

      // Changed shipping (follow policy)
      // Special rule: if there are no changed items for this platform (e.g., deleted without replacement),
      // then there's nothing to buy here -> shipping should be 0.
      let changedShip: number;
      let changedRemain: number;
      const platformRemoved = changedItems.length === 0;
      if (platformRemoved) {
        changedShip = 0;
        // With no purchase on this platform, the notion of "remain to free" doesn't apply.
        // Set to 0 to avoid misleading positive numbers in UI.
        changedRemain = 0;
      } else {
        const changedFree =
          thresholdBasedFree && changedTotal >= freeShippingPrice;
        changedShip = changedFree ? 0 : shippingPrice;
        // Remain can be negative if total exceeds freeShippingPrice
        changedRemain = thresholdBasedFree
          ? freeShippingPrice - changedTotal
          : 0; // No free threshold when policy is 'N'
      }

      const hasChanges =
        Math.round(changedTotal) !== Math.round(originalTotal) ||
        changedShip !== originalShip ||
        Math.round(changedRemain) !== Math.round(originalRemain);

      return {
        platformNm,
        originalTotalPrice: originalTotal,
        changedTotalPrice: changedTotal,
        originalShippingPrice: originalShip,
        changedShippingPrice: changedShip,
        originalRemainToFree: originalRemain,
        changedRemainToFree: changedRemain,
        hasChanges,
        removed: platformRemoved,
      };
    }
  );

  const collator = new Intl.Collator("ko", { sensitivity: "base" });
  // Sort by lowest positive remain-to-free first (only where shipping is not free),
  // then by lower shipping price, then by name as a final tie-breaker.
  return summaries.sort((a, b) => {
    const aIsCandidate =
      a.changedShippingPrice > 0 && a.changedRemainToFree > 0;
    const bIsCandidate =
      b.changedShippingPrice > 0 && b.changedRemainToFree > 0;

    // Candidates (need more to reach free) come before non-candidates
    if (aIsCandidate !== bIsCandidate) return aIsCandidate ? -1 : 1;

    // If both are candidates, sort by remain ascending
    if (aIsCandidate && bIsCandidate) {
      if (a.changedRemainToFree !== b.changedRemainToFree) {
        return a.changedRemainToFree - b.changedRemainToFree;
      }
      // Tie-breaker: lower shipping price first
      if (a.changedShippingPrice !== b.changedShippingPrice) {
        return a.changedShippingPrice - b.changedShippingPrice;
      }
      // Final tie-breaker: name
      return collator.compare(a.platformNm, b.platformNm);
    }

    // Both are non-candidates (already free):
    // Sort by changedRemainToFree descending (closer to zero first, most negative last)
    if (!aIsCandidate && !bIsCandidate) {
      if (a.changedRemainToFree !== b.changedRemainToFree) {
        return b.changedRemainToFree - a.changedRemainToFree;
      }
      // Final tie-breaker: name
      return collator.compare(a.platformNm, b.platformNm);
    }

    // Fallback (should not hit)
    return 0;
  });
}

export interface SummaryTotals {
  originalProductsTotal: number;
  changedProductsTotal: number;
  originalShippingTotal: number;
  changedShippingTotal: number;
  originalGrandTotal: number; // products + shipping
  changedGrandTotal: number; // products + shipping
  platformNum: number;
  menuNumTotal: number;
  productNumTotal: number;
  // 순위별 무료배송목표 식품사리스트
  freeShippingTarget: PlatformSummary[];
  // 순위별 제외가능 식품사 리스트
  alreadyFreeShipping: PlatformSummary[];
}
/**
 * Aggregates summary totals from platform summaries and menu data in a single loop.
 * @param summaries - Array of PlatformSummary
 * @param dTOData - Diet data from server
 * @param dietQtyMap - Optional: map of dietNo to new qty
 */
export function getSummaryTotalsFromSummaries(
  summaries: PlatformSummary[],
  dTOData: IDietTotalObjData | undefined,
  dietQtyMap?: Record<string, number>
): SummaryTotals {
  let originalProductsTotal = 0;
  let changedProductsTotal = 0;
  let originalShippingTotal = 0;
  let changedShippingTotal = 0;
  // menuNumTotal: sum of all menu quantities (from dTOData)
  let menuNumTotal = 0;
  let productNumTotal = 0;
  const platformNum = summaries.length;

  for (let i = 0; i < summaries.length; i++) {
    const s = summaries[i];
    originalProductsTotal += s.originalTotalPrice;
    changedProductsTotal += s.changedTotalPrice;
    originalShippingTotal += s.originalShippingPrice;
    changedShippingTotal += s.changedShippingPrice;
  }
  if (dTOData) {
    for (const dietNo of Object.keys(dTOData)) {
      menuNumTotal +=
        dietQtyMap?.[dietNo] ||
        parseInt(dTOData[dietNo]?.dietDetail[0]?.qty) ||
        0;

      for (const p of dTOData[dietNo]?.dietDetail || []) {
        productNumTotal += dietQtyMap?.[dietNo] ?? parseInt(p.qty) ?? 0;
      }
    }
  }

  // Separate platforms based on changedRemainToFree value
  // The summaries are already sorted by getPlatformSummaries, so we just need to filter them
  const freeShippingTarget: PlatformSummary[] = [];
  const alreadyFreeShipping: PlatformSummary[] = [];

  for (const summary of summaries) {
    summary.changedRemainToFree >= 0
      ? freeShippingTarget.push(summary)
      : alreadyFreeShipping.unshift(summary);
  }

  return {
    originalProductsTotal,
    changedProductsTotal,
    originalShippingTotal,
    changedShippingTotal,
    originalGrandTotal: originalProductsTotal + originalShippingTotal,
    changedGrandTotal: changedProductsTotal + changedShippingTotal,
    platformNum,
    menuNumTotal,
    productNumTotal,
    freeShippingTarget,
    alreadyFreeShipping,
  };
}

// Convenience helper to compute grand totals from the same inputs
export function getSummaryTotals(
  dTOData: IDietTotalObjData | undefined,
  dietQtyMap?: Record<string, number>,
  foodChangeMap?: Record<string, FoodChange>
): SummaryTotals {
  const summaries = getPlatformSummaries(dTOData, dietQtyMap, foodChangeMap);
  return getSummaryTotalsFromSummaries(summaries, dTOData, dietQtyMap);
}

export const getDietNum = (dTOData: IDietTotalObjData | undefined) => {
  if (!dTOData)
    return {
      menuNum: 0,
      productNum: 0,
      menuKindNum: 0,
      menuKindLabel: "",
      menuNumLabel: "",
    };
  const dietNoArr = Object.keys(dTOData);
  const menuKindNum = dietNoArr.length;

  let menuNum = 0;
  let productNum = 0;

  dietNoArr.forEach((dietNo) => {
    const dietDetail = dTOData[dietNo]?.dietDetail || [];
    const menuQty = parseInt(dietDetail[0]?.qty) || 0;
    menuNum += menuQty;
    dietDetail.forEach((item) => {
      const productQty = parseInt(item?.qty) || 0;
      productNum += productQty;
    });
  });

  console.log("--------- getDietNum ---------");
  console.log("menuKindNum:", menuKindNum);
  console.log("menuNum:", menuNum);
  console.log("productNum:", productNum);
  console.log("menuKindLabel:", MENU_KIND_LABEL[menuKindNum - 1]);
  console.log("menuNumLabel:", MENU_NUM_LABEL[menuNum - 1]);
  console.log("------------------------------");

  return {
    menuNum,
    productNum,
    menuKindNum,
    menuKindLabel: MENU_KIND_LABEL[menuKindNum - 1],
    menuNumLabel: MENU_NUM_LABEL[menuNum - 1],
  };
};
