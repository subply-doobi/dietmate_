import { IDietTotalObjData } from "@/shared/api/types/diet";

/**
 * Height constants for DietCard layout calculations
 */
const DIET_CARD_CONSTANTS = {
  // Card wrapper
  CARD_PADDING_VERTICAL: 24 * 2, // top + bottom
  CARD_MARGIN_BOTTOM: 16, // gap between cards
  CARD_BORDER_RADIUS: 16,

  // Header section
  HEADER_HEIGHT: 32,
  HEADER_MARGIN_BOTTOM: 24,

  // Seller section
  SELLER_NAME_HEIGHT: 16, // font-size: 12px, line-height: 16px
  SELLER_MARGIN_BOTTOM: 12,

  // Product row (ProductRow component)
  PRODUCT_ROW_HEIGHT: 40, // image + padding
  PRODUCT_ROW_GAP: 12, // gap between products

  // Seller group gap
  SELLER_GROUP_GAP: 20,

  // Selected product extras
  SELECTED_PADDING: 16 * 2, // when isSelected, padding adds height
  SELECTED_BORDER: 1 * 2, // border-width adds to height

  // Change button (DietCardChangeBtn) - approximate
  CHANGE_BTN_BASE_HEIGHT: 40, // base button height
  CHANGE_BTN_MARGIN_TOP: 24,

  // CTA button at bottom (DietCardCta)
  CTA_MARGIN_TOP: 24,
  CTA_BUTTON_HEIGHT: 40,
};

/**
 * Calculate the height of a single DietCard based on its content
 *
 * @param dietNo - The diet number to calculate height for
 * @param dTOData - Complete diet data
 * @param selectedPMap - Current selection state (to account for expanded states)
 * @param decisions - CTA decisions (to account for change button visibility)
 * @returns Calculated height in pixels
 */
export function calculateDietCardHeight(
  dietNo: string,
  dTOData: IDietTotalObjData | undefined,
  selectedPMap: Record<string, any>,
  decisions: Record<string, any>
): number {
  if (!dTOData || !dTOData[dietNo]) {
    // Empty card: header + empty message
    return (
      DIET_CARD_CONSTANTS.CARD_PADDING_VERTICAL +
      DIET_CARD_CONSTANTS.HEADER_HEIGHT +
      DIET_CARD_CONSTANTS.HEADER_MARGIN_BOTTOM +
      40 // empty message height
    );
  }

  const dietDetail = dTOData[dietNo]?.dietDetail || [];
  const isEmpty = dietDetail.length === 0;

  if (isEmpty) {
    // Empty card
    return (
      DIET_CARD_CONSTANTS.CARD_PADDING_VERTICAL +
      DIET_CARD_CONSTANTS.HEADER_HEIGHT +
      DIET_CARD_CONSTANTS.HEADER_MARGIN_BOTTOM +
      40
    );
  }

  // Start with card padding + header
  let totalHeight =
    DIET_CARD_CONSTANTS.CARD_PADDING_VERTICAL +
    DIET_CARD_CONSTANTS.HEADER_HEIGHT +
    DIET_CARD_CONSTANTS.HEADER_MARGIN_BOTTOM;

  // Group products by seller
  const regrouped: Record<string, any[]> = {};
  dietDetail.forEach((product) => {
    const seller = product.platformNm;
    if (!regrouped[seller]) {
      regrouped[seller] = [];
    }
    regrouped[seller].push(product);
  });

  const sellers = Object.keys(regrouped);
  const selected = selectedPMap[dietNo];
  const pToRemove = selected?.pToRemove;
  const pToAdd = selected?.pToAdd;
  const decision = decisions[dietNo];

  // Calculate height for each seller group
  sellers.forEach((seller, sellerIdx) => {
    const products = regrouped[seller] || [];

    // Seller name
    totalHeight += DIET_CARD_CONSTANTS.SELLER_NAME_HEIGHT;
    totalHeight += DIET_CARD_CONSTANTS.SELLER_MARGIN_BOTTOM;

    // Products
    products.forEach((product, productIdx) => {
      const isSelected =
        pToRemove?.dietNo === dietNo &&
        pToRemove?.product?.productNo === product.productNo;

      if (isSelected) {
        // Selected product box has padding and border
        totalHeight += DIET_CARD_CONSTANTS.SELECTED_PADDING;
        totalHeight += DIET_CARD_CONSTANTS.SELECTED_BORDER;
      }

      // Base product row
      totalHeight += DIET_CARD_CONSTANTS.PRODUCT_ROW_HEIGHT;

      // Change button section (if applicable)
      if (isSelected && decision?.type === "Change") {
        totalHeight += DIET_CARD_CONSTANTS.CHANGE_BTN_MARGIN_TOP;
        totalHeight += DIET_CARD_CONSTANTS.CHANGE_BTN_BASE_HEIGHT;

        // If candidates are showing, add extra height
        // This is approximate - actual height depends on candidate list state
        // You may need to pass pChangeStep to be more accurate
      }

      // Gap between products
      if (productIdx < products.length - 1) {
        totalHeight += DIET_CARD_CONSTANTS.PRODUCT_ROW_GAP;
      }
    });

    // Gap between seller groups
    if (sellerIdx < sellers.length - 1) {
      totalHeight += DIET_CARD_CONSTANTS.SELLER_GROUP_GAP;
    }
  });

  // CTA button at bottom (if exists)
  if (decision && decision.type !== "None") {
    totalHeight += DIET_CARD_CONSTANTS.CTA_MARGIN_TOP;
    totalHeight += DIET_CARD_CONSTANTS.CTA_BUTTON_HEIGHT;
  }

  return totalHeight;
}

/**
 * Calculate the Y position (scroll offset) to reach a specific diet card
 *
 * @param targetDietNo - The diet number to scroll to
 * @param dTOData - Complete diet data
 * @param selectedPMap - Current selection state
 * @param decisions - CTA decisions
 * @returns Y offset in pixels from the top
 */
export function calculateDietCardYPosition(
  targetDietNo: string,
  dTOData: IDietTotalObjData | undefined,
  selectedPMap: Record<string, any>,
  decisions: Record<string, any>
): number {
  if (!dTOData) return 0;

  const dietNos = Object.keys(dTOData);
  const targetIndex = dietNos.indexOf(targetDietNo);

  if (targetIndex === -1) return 0;

  let yPosition = 0;

  // Sum up heights of all cards before the target
  for (let i = 0; i < targetIndex; i++) {
    const dietNo = dietNos[i];
    const cardHeight = calculateDietCardHeight(
      dietNo,
      dTOData,
      selectedPMap,
      decisions
    );
    yPosition += cardHeight;
    yPosition += DIET_CARD_CONSTANTS.CARD_MARGIN_BOTTOM; // gap between cards
  }

  return yPosition;
}

/**
 * Calculate Y positions for all diet cards
 * Useful for quick lookup without recalculating
 *
 * @param dTOData - Complete diet data
 * @param selectedPMap - Current selection state
 * @param decisions - CTA decisions
 * @returns Map of dietNo → Y position
 */
export function calculateAllDietCardPositions(
  dTOData: IDietTotalObjData | undefined,
  selectedPMap: Record<string, any>,
  decisions: Record<string, any>
): Record<string, number> {
  if (!dTOData) return {};

  const positions: Record<string, number> = {};
  const dietNos = Object.keys(dTOData);
  let currentY = 0;

  dietNos.forEach((dietNo) => {
    positions[dietNo] = currentY;
    const cardHeight = calculateDietCardHeight(
      dietNo,
      dTOData,
      selectedPMap,
      decisions
    );
    currentY += cardHeight + DIET_CARD_CONSTANTS.CARD_MARGIN_BOTTOM;
  });

  return positions;
}
