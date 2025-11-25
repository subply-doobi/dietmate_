// Utility: Convert dTOData to dietQtyMap

import {
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CtaDecisionDetail } from "@/shared/utils/ctaDecision";
import { bsConfigByName, IBSNm } from "@/components/bottomSheet/bsConfig";

export type IBSAction =
  | { type: "open"; bsNm: IBSNm; from?: string }
  | { type: "close"; bsNm?: IBSNm; from?: string }
  | { type: "closeAll"; from?: string }
  | { type: "snapToIndex"; index: number; bsNm: IBSNm; from?: string }
  | { type: "expand"; bsNm: IBSNm; from?: string }
  | {
      type: "scrollTo";
      x?: number;
      y?: number;
      animated?: boolean;
      bsNm: IBSNm;
      from?: string;
    };

interface IBSLastSnapshot {
  bsNm: IBSNm;
  index: number;
  position: number;
  scrollOffset: number;
}

interface BottomSheetState {
  bsData: {
    pToAdd: IProductData[];
    pToDel: IDietDetailProductData[];
    summaryInfo: {
      dietQtyMap: Record<string, number>; // menu : qty
      originalDietQtyMap: Record<string, number>; // menu : qty
      changedDietNoArr: string[];
      ctaDecisions: Record<string, CtaDecisionDetail>; // menu : decisionDetail
      selectedPMap: Record<
        string,
        {
          pToRemove: { dietNo: string; product: IDietDetailProductData } | null;
          pToAdd: { dietNo: string; product: IProductData } | null;
        }
      >; // menu : {pToRemove, pToAdd}
      pChangeStep: "standBy" | "showCandidates";
    };
  };
  bsNmArr: IBSNm[];
  actionQueue: IBSAction[];
  currentValue: { index: number; position: number };
  lastSnapshot: IBSLastSnapshot | null;
}

// --- Stack helpers ---
function pushStack(stack: IBSNm[], value: IBSNm) {
  return [...stack, value];
}
function removeFromStack(stack: IBSNm[], value: IBSNm) {
  return stack.filter((v) => v !== value);
}
function peekStack(stack: IBSNm[]) {
  return stack[stack.length - 1];
}

// Converts dTOData to dietQtyMap
function getDietQtyMapFromDTO(
  dTOData?: IDietTotalObjData
): Record<string, number> {
  if (!dTOData) return {};
  const nextQtyMap: Record<string, number> = {};
  Object.keys(dTOData).forEach((dietNo) => {
    const dietDetail = dTOData[dietNo]?.dietDetail || [];
    const qtyNums = dietDetail.map((d: any) => parseInt(d.qty));
    nextQtyMap[dietNo] = qtyNums.length === 0 ? 1 : qtyNums[0];
  });
  return nextQtyMap;
}

const initialState: BottomSheetState = {
  bsNmArr: [],
  actionQueue: [],
  currentValue: { index: -1, position: 0 },
  lastSnapshot: null,
  bsData: {
    pToAdd: [],
    pToDel: [],
    summaryInfo: {
      dietQtyMap: {},
      originalDietQtyMap: {},
      changedDietNoArr: [],
      ctaDecisions: {},
      selectedPMap: {},
      pChangeStep: "standBy",
    },
  },
};

const bottomSheetSlice = createSlice({
  name: "bottomSheet",
  initialState,
  reducers: {
    openBS: (
      state,
      action: PayloadAction<{ bsNm: IBSNm; from?: string; option?: "reset" }>
    ) => {
      const { bsNm, from, option } = action.payload;
      const top = peekStack(state.bsNmArr);
      const lastAction = state.actionQueue[state.actionQueue.length - 1];

      // if duplicate action, do nothing
      if (lastAction?.type === "open" && lastAction.bsNm === bsNm) {
        return;
      }

      // If another is open, queue close and open
      if (state.bsNmArr.length > 0 && top !== bsNm) {
        state.actionQueue.push({ type: "close", bsNm: top, from });
        state.actionQueue.push({
          type: "open",
          bsNm: bsNm,
          from,
        });
        state.bsNmArr =
          option === "reset"
            ? [bsNm]
            : pushStack(removeFromStack(state.bsNmArr, bsNm), bsNm);

        return;
      }

      // default
      state.actionQueue.push({
        type: "open",
        bsNm: bsNm,
        from,
      });
      state.bsNmArr =
        option === "reset"
          ? [bsNm]
          : pushStack(removeFromStack(state.bsNmArr, bsNm), bsNm);

      return;
    },
    closeBS: (
      state,
      action: PayloadAction<{
        bsNm: IBSNm;
        from?: string;
      }>
    ) => {
      const from = action?.payload.from;
      const bsNm = action?.payload.bsNm;
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      const isTop = peekStack(state.bsNmArr) === bsNm;

      if (lastAction?.type === "close" && lastAction.bsNm === bsNm) return;
      if (state.bsNmArr.length === 0) return;

      if (!state.bsNmArr.includes(bsNm)) return;

      state.bsNmArr = removeFromStack(state.bsNmArr, bsNm);
      if (!isTop) return;
      state.actionQueue.push({ type: "close", bsNm, from });
      // If it was the top, open the new top if any
      if (isTop && state.bsNmArr.length > 0) {
        state.actionQueue.push({
          type: "open",
          bsNm: peekStack(state.bsNmArr)!,
          from,
        });
      }
    },
    closeBSAll: (
      state,
      action: PayloadAction<
        { from?: string; scrollOffset?: number } | undefined
      >
    ) => {
      const from =
        action?.payload && typeof action.payload === "object"
          ? action.payload.from
          : undefined;
      const scrollOffset =
        action?.payload && typeof action.payload === "object"
          ? action.payload.scrollOffset ?? 0
          : 0;

      // if no bottom sheet open, do nothing
      if (state.bsNmArr.length === 0) return;

      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "closeAll") return;
      state.bsNmArr = [];
      state.actionQueue.push({ type: "closeAll", from });
    },
    closeBSWOAction: (
      state,
      action: PayloadAction<{ from?: string } | undefined>
    ) => {
      const from =
        action?.payload && typeof action.payload === "object"
          ? action.payload.from
          : undefined;
      const top = peekStack(state.bsNmArr);
      state.bsNmArr = removeFromStack(state.bsNmArr, top);
      state.bsNmArr.length > 0 &&
        state.actionQueue.push({
          type: "open",
          bsNm: peekStack(state.bsNmArr)!,
          from,
        });
    },

    snapBS: (
      state,
      action: PayloadAction<{ index: number; bsNm: IBSNm; from?: string }>
    ) => {
      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "snapToIndex") return;

      // if not current bs, do nothing
      const top = peekStack(state.bsNmArr);
      if (top !== action.payload.bsNm) return;

      const { index, bsNm, from } = action.payload;
      state.actionQueue.push({ type: "snapToIndex", index, bsNm, from });
    },
    expandBS: (
      state,
      action: PayloadAction<{ bsNm: IBSNm; from?: string }>
    ) => {
      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "expand") return;

      // if not current bs, do nothing
      const top = peekStack(state.bsNmArr);
      if (top !== action.payload.bsNm) return;

      // if already expanded, do nothing
      const snapPoints = bsConfigByName[action.payload.bsNm]?.snapPoints;
      const maxIndex = snapPoints ? snapPoints.length - 1 : 0;
      if (state.currentValue.index > maxIndex) return;

      const { bsNm, from } = action.payload;
      state.actionQueue.push({ type: "expand", bsNm, from });
    },
    scrollToBS: (
      state,
      action: PayloadAction<{
        x?: number;
        y?: number;
        animated?: boolean;
        bsNm: IBSNm;
        from?: string;
      }>
    ) => {
      // if not current bs, do nothing
      const top = peekStack(state.bsNmArr);
      if (top !== action.payload.bsNm) return;

      const { x = 0, y = 0, animated = true, bsNm, from } = action.payload;
      state.actionQueue.push({ type: "scrollTo", x, y, animated, bsNm, from });
    },
    dequeueBSAction: (state) => {
      if (state.actionQueue.length > 0) {
        state.actionQueue.shift();
      }
    },
    resetBSActionQueue: (state) => {
      state.actionQueue = [];
    },

    // product select
    setProductToAdd: (state, action: PayloadAction<IProductData[]>) => {
      state.bsData.pToAdd = action.payload;
    },
    setProductToDel: (
      state,
      action: PayloadAction<IDietDetailProductData[]>
    ) => {
      state.bsData.pToDel = action.payload;
    },
    deleteBSProduct: (state) => {
      state.bsData.pToAdd = [];
      state.bsData.pToDel = [];
    },
    setCurrentValue: (
      state,
      action: PayloadAction<{ index: number; position: number }>
    ) => {
      state.currentValue = action.payload;
    },
    setLastSnapshot: (state, action: PayloadAction<IBSLastSnapshot | null>) => {
      state.lastSnapshot = action.payload;
    },
    resetBSData: (state) => {
      state.bsData = initialState.bsData;
    },

    // --- summaryInfo selection ---
    setSummaryInfoPToRemove: (
      state,
      action: PayloadAction<{
        dietNo: string;
        product: IDietDetailProductData;
      } | null>
    ) => {
      state.bsData.summaryInfo.pChangeStep = "standBy";
      if (!action.payload) {
        // Clear all selections
        state.bsData.summaryInfo.selectedPMap = {};
        return;
      }
      const { dietNo, product } = action.payload;
      // Clear other menus' selections and set this one
      state.bsData.summaryInfo.selectedPMap = {
        [dietNo]: {
          pToRemove: { dietNo, product },
          pToAdd: null,
        },
      };
    },
    setSummaryInfoPToAdd: (
      state,
      action: PayloadAction<{
        dietNo: string;
        product: IProductData;
      } | null>
    ) => {
      const originalDietNo: string | undefined = Object.keys(
        state.bsData.summaryInfo.selectedPMap
      )[0];
      if (!originalDietNo) return;
      if (!action.payload) {
        state.bsData.summaryInfo.selectedPMap[originalDietNo].pToAdd = null;
        return;
      }
      const { dietNo, product } = action.payload;
      if (dietNo !== originalDietNo) return;

      const isSamePSelected =
        state.bsData.summaryInfo.selectedPMap[originalDietNo].pToAdd?.product
          .productNo === product.productNo;

      if (isSamePSelected) {
        // Deselect if same product selected
        state.bsData.summaryInfo.selectedPMap[originalDietNo].pToAdd = null;
        return;
      }

      state.bsData.summaryInfo.selectedPMap[originalDietNo].pToAdd = {
        dietNo,
        product,
      };
    },

    // --- summaryInfoBSComp diet qty logic ---
    syncDietQtyMap: (
      state,
      action: PayloadAction<IDietTotalObjData | undefined>
    ) => {
      // Accepts dTOData as payload, converts to dietQtyMap
      const newMap = getDietQtyMapFromDTO(action.payload);
      state.bsData.summaryInfo.dietQtyMap = newMap;
      state.bsData.summaryInfo.originalDietQtyMap = { ...newMap };
      state.bsData.summaryInfo.changedDietNoArr = [];
    },
    setDietQtyMap: (state, action: PayloadAction<Record<string, number>>) => {
      const qtyMapToApply = action.payload;
      state.bsData.summaryInfo.dietQtyMap = {
        ...state.bsData.summaryInfo.dietQtyMap,
        ...qtyMapToApply,
      };
      // Compare with originalDietQtyMap
      const original = state.bsData.summaryInfo.originalDietQtyMap || {};
      state.bsData.summaryInfo.changedDietNoArr = Object.keys(
        state.bsData.summaryInfo.dietQtyMap
      ).filter(
        (dNo) =>
          state.bsData.summaryInfo.dietQtyMap[dNo] !== (original[dNo] ?? 1)
      );
    },
    plusQty: (state, action: PayloadAction<{ dietNo: string }>) => {
      const { dietNo } = action.payload;
      const cur = state.bsData.summaryInfo.dietQtyMap[dietNo] ?? 1;
      if (cur >= 10) return;
      const totalMenu = Object.values(
        state.bsData.summaryInfo.dietQtyMap
      ).reduce((a, b) => Number(a) + Number(b), 0);
      if (totalMenu >= 10) return;
      state.bsData.summaryInfo.dietQtyMap[dietNo] = cur + 1;
      // Compare with originalDietQtyMap
      const original = state.bsData.summaryInfo.originalDietQtyMap || {};
      state.bsData.summaryInfo.changedDietNoArr = Object.keys(
        state.bsData.summaryInfo.dietQtyMap
      ).filter(
        (dNo) =>
          state.bsData.summaryInfo.dietQtyMap[dNo] !== (original[dNo] ?? 1)
      );
    },
    minusQty: (state, action: PayloadAction<{ dietNo: string }>) => {
      const { dietNo } = action.payload;
      const cur = state.bsData.summaryInfo.dietQtyMap[dietNo] ?? 1;
      if (cur <= 1) return;
      state.bsData.summaryInfo.dietQtyMap[dietNo] = cur - 1;
      // Compare with originalDietQtyMap
      const original = state.bsData.summaryInfo.originalDietQtyMap || {};
      state.bsData.summaryInfo.changedDietNoArr = Object.keys(
        state.bsData.summaryInfo.dietQtyMap
      ).filter(
        (dNo) =>
          state.bsData.summaryInfo.dietQtyMap[dNo] !== (original[dNo] ?? 1)
      );
    },
    // Lower shipping CTA decisions per menu
    setLoweringCtaDecision: (
      state,
      action: PayloadAction<Record<string, CtaDecisionDetail>>
    ) => {
      state.bsData.summaryInfo.ctaDecisions = action.payload || {};
    },
    setPChangeStep: (
      state,
      action: PayloadAction<"standBy" | "showCandidates">
    ) => {
      state.bsData.summaryInfo.pChangeStep = action.payload;
    },
    resetLoweringCta: (state) => {
      state.bsData.summaryInfo.ctaDecisions = {};
      state.bsData.summaryInfo.pChangeStep = "standBy";
      state.bsData.summaryInfo.selectedPMap = {};
    },
  },
});

export const {
  // bs actions
  openBS,
  closeBS,
  closeBSAll,
  closeBSWOAction,
  snapBS,
  expandBS,
  scrollToBS,

  // bs value in onChange
  setCurrentValue,
  setLastSnapshot,

  // action queue
  dequeueBSAction,
  resetBSActionQueue,

  // bsData
  syncDietQtyMap,
  plusQty,
  minusQty,
  setProductToAdd,
  setProductToDel,
  deleteBSProduct,
  resetBSData,
  setLoweringCtaDecision,
  resetLoweringCta,
  setDietQtyMap,
  setSummaryInfoPToRemove,
  setSummaryInfoPToAdd,
  setPChangeStep,
} = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
