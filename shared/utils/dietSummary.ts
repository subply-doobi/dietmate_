import {
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";

export interface PlatformSummary {
  platformNm: string;
  originalTotalPrice: number;
  changedTotalPrice: number;
  originalShippingPrice: number; // 0 if free
  changedShippingPrice: number; // 0 if free
  originalRemainToFree: number; // 0 if already free
  changedRemainToFree: number; // 0 if already free
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
  delete?: string; // productNo to delete
  add?: IDietDetailProductData; // product to add
}

/**
 * Computes platform summaries for the user's diet cart.
 * @param dTOData - Diet data from server
 * @param dietQtyMap - Optional: map of dietNo to new qty (if not provided, use product qty)
 * @param foodChangeMap - Optional: map of dietNo to {delete, add} food change
 */
export function computePlatformSummaries(
  dTOData: IDietTotalObjData | undefined,
  dietQtyMap?: Record<string, number>,
  foodChangeMap?: Record<string, FoodChange>
): PlatformSummary[] {
  if (!dTOData) return [];

  // Group items by platformNm
  const byPlatform: Record<string, IDietDetailProductData[]> = {};

  Object.values(dTOData).forEach(({ dietNo, dietDetail }) => {
    (dietDetail || []).forEach((item) => {
      const platform = item.platformNm || "";
      if (!byPlatform[platform]) byPlatform[platform] = [];
      byPlatform[platform].push(item);
    });
  });

  const platformEntries = Object.entries(byPlatform);
  const summaries: PlatformSummary[] = platformEntries.map(
    ([platformNm, items]) => {
      // --- Original total: always use product qty ---
      let originalTotal = 0;
      items.forEach((item) => {
        const price = toNumber(item.price, 0);
        const qty = toNumber(item.qty, 1);
        originalTotal += price * qty;
      });

      // --- Changed total: apply dietQtyMap and foodChangeMap if present ---
      let changedTotal = 0;
      // 1. Start with all items
      let changedItems = [...items];
      // 2. Apply food change: for each dietNo, if both delete and add, swap
      if (foodChangeMap) {
        Object.entries(foodChangeMap).forEach(([dietNo, change]) => {
          if (change.delete && change.add) {
            // Remove the item with productNo == delete
            changedItems = changedItems.filter(
              (it) => it.dietNo !== dietNo || it.productNo !== change.delete
            );
            // Add the new food (with correct dietNo)
            changedItems.push({ ...change.add, dietNo });
          }
        });
      }
      // 3. Apply qty changes if present
      changedItems.forEach((item) => {
        const price = toNumber(item.price, 0);
        const originalQty = toNumber(item.qty, 1);
        const changedQty =
          dietQtyMap && item.dietNo in dietQtyMap
            ? dietQtyMap[item.dietNo]
            : originalQty;
        changedTotal += price * changedQty;
      });

      const { shippingPrice, freeShippingPrice, thresholdBasedFree } =
        pickPlatformPolicy(items);

      // Original shipping (follow policy)
      const originalFree =
        thresholdBasedFree && originalTotal >= freeShippingPrice;
      const originalShip = originalFree ? 0 : shippingPrice;
      const originalRemain = thresholdBasedFree
        ? originalFree
          ? 0
          : Math.max(0, freeShippingPrice - originalTotal)
        : 0; // No free threshold when policy is 'N'

      // Changed shipping (follow policy)
      const changedFree =
        thresholdBasedFree && changedTotal >= freeShippingPrice;
      const changedShip = changedFree ? 0 : shippingPrice;
      const changedRemain = thresholdBasedFree
        ? changedFree
          ? 0
          : Math.max(0, freeShippingPrice - changedTotal)
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
  return summaries.sort((a, b) => collator.compare(a.platformNm, b.platformNm));
}

export interface SummaryTotals {
  originalProductsTotal: number;
  changedProductsTotal: number;
  originalShippingTotal: number;
  changedShippingTotal: number;
  originalGrandTotal: number; // products + shipping
  changedGrandTotal: number; // products + shipping
  menuNumTotal: number;
}

// Convenience helper to compute grand totals from the same inputs
export function computeSummaryTotals(
  dTOData: IDietTotalObjData | undefined,
  dietQtyMap?: Record<string, number>,
  foodChangeMap?: Record<string, FoodChange>
): SummaryTotals {
  const summaries = computePlatformSummaries(
    dTOData,
    dietQtyMap,
    foodChangeMap
  );
  const originalProductsTotal = summaries.reduce(
    (acc, s) => acc + s.originalTotalPrice,
    0
  );
  const changedProductsTotal = summaries.reduce(
    (acc, s) => acc + s.changedTotalPrice,
    0
  );
  const originalShippingTotal = summaries.reduce(
    (acc, s) => acc + s.originalShippingPrice,
    0
  );
  const changedShippingTotal = summaries.reduce(
    (acc, s) => acc + s.changedShippingPrice,
    0
  );
  const menuNumTotal = Object.keys(dTOData || {}).reduce(
    (acc, dietNo) => acc + (dietQtyMap?.[dietNo] || 0),
    0
  );
  return {
    originalProductsTotal,
    changedProductsTotal,
    originalShippingTotal,
    changedShippingTotal,
    originalGrandTotal: originalProductsTotal + originalShippingTotal,
    changedGrandTotal: changedProductsTotal + changedShippingTotal,
    menuNumTotal,
  };
}
