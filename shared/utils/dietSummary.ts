import {
  IDietDetailData,
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import { SERVICE_PRICE_PER_PRODUCT } from "../constants";
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

  // Handle food changes to add items to platforms even if dTOData is empty
  if (foodChangeMap) {
    Object.entries(foodChangeMap).forEach(([dietNo, change]) => {
      if (change.add) {
        const platform = change.add.platformNm || "";
        if (!byPlatform[platform]) byPlatform[platform] = [];

        const currentDietQty = dietQtyMap?.[dietNo]
          ? String(dietQtyMap[dietNo])
          : dTOData?.[dietNo]?.dietDetail[0]?.qty || "1";

        const addItem = {
          ...change.add,
          dietNo,
          qty: currentDietQty,
          dietSeq: "",
          statusCd: "",
          statusNm: "",
        };

        // Add the item to the platform for processing
        byPlatform[platform].push(addItem);
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
        const qty = toNumber(item.qty, 1);
        originalTotal += price * qty;
      });

      // --- Changed total: apply dietQtyMap and foodChangeMap if present ---
      let changedTotal = 0;
      // 1. Start with original items
      let changedItems = [...originalItems];

      // 2. Apply food changes
      if (foodChangeMap) {
        Object.entries(foodChangeMap).forEach(([dietNo, change]) => {
          // Remove item if delete is specified
          if (change.delete) {
            changedItems = changedItems.filter(
              (it) =>
                it.dietNo !== dietNo ||
                it.productNo !== change.delete?.productNo
            );
          }
          // Add item if add is specified
          if (change.add) {
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
        });
      }
      // 3. Apply qty changes if present
      changedItems.forEach((item) => {
        const price = toNumber(item.price, 0) + SERVICE_PRICE_PER_PRODUCT;
        const originalQty = toNumber(item.qty, 1);
        const changedQty =
          dietQtyMap && item.dietNo in dietQtyMap
            ? dietQtyMap[item.dietNo]
            : originalQty;
        changedTotal += price * changedQty;
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
      const changedFree =
        thresholdBasedFree && changedTotal >= freeShippingPrice;
      const changedShip = changedFree ? 0 : shippingPrice;
      // Remain can be negative if total exceeds freeShippingPrice
      const changedRemain = thresholdBasedFree
        ? freeShippingPrice - changedTotal
        : 0; // No free threshold when policy is 'N'

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
  menuNumTotal: number;
  productNumTotal: number;
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
  return {
    originalProductsTotal,
    changedProductsTotal,
    originalShippingTotal,
    changedShippingTotal,
    originalGrandTotal: originalProductsTotal + originalShippingTotal,
    changedGrandTotal: changedProductsTotal + changedShippingTotal,
    menuNumTotal,
    productNumTotal,
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

// ---- Lowest remain helpers ----

export interface LowestRemainResult {
  platformNm: string;
  remain: number; // strictly > 0
  summary: PlatformSummary;
}
