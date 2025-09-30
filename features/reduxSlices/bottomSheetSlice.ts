import { bsConfigByName } from "@/components/bottomSheet/GlobalBSM";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import { IProductData, IProductDetailData } from "@/shared/api/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type IBSNm =
  // sort and filter
  | "baseListTypeFilter"
  | "categoryFilter"
  | "platformFilter"
  | "sort"
  // product select
  | "productToAddSelect"
  | "productToDelSelect"
  // menu qty change
  | "qtyChange"
  // formula summary
  | "summaryInfo";

export type IBSAction =
  | { type: "open"; bsNm: IBSNm; from?: string }
  | { type: "close"; bsNm?: IBSNm; from?: string }
  | { type: "closeAll"; from?: string }
  | { type: "snapToIndex"; index: number; bsNm: IBSNm; from?: string }
  | { type: "expand"; bsNm: IBSNm; from?: string };

interface BottomSheetState {
  bsNmArr: IBSNm[];
  actionQueue: IBSAction[];
  currentValue: { index: number; position: number };
  bsData: {
    pToAdd: (IProductData | IDietDetailProductData)[];
    pToDel: (IProductData | IDietDetailProductData)[];
    qtyChange: {
      menuIdx: number;
    };
  };
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

const initialState: BottomSheetState = {
  bsNmArr: [],
  actionQueue: [],
  currentValue: { index: -1, position: 0 },
  bsData: {
    pToAdd: [],
    pToDel: [],
    qtyChange: { menuIdx: 0 },
  },
};

const bottomSheetSlice = createSlice({
  name: "bottomSheet",
  initialState,
  reducers: {
    // bs action
    // 1. 열린 경우
    // 	1. 다른 bs
    // 	2. 같은 bs
    // 2. 닫힌 경우
    // 	1. bsNm 없는 경우
    // 		1. 다른 bsNm도 없는 경우
    // 		2. 다른 bs 있는데 닫힌 경우가 있나?
    // 	2. bsNm 있는 경우
    // 		1. 맨 위인데 닫힌 경우
    // 		2. 다른 bs 아래에 있는 경우
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
        state.actionQueue.push({ type: "open", bsNm: bsNm, from });
        state.bsNmArr =
          option === "reset"
            ? [bsNm]
            : pushStack(removeFromStack(state.bsNmArr, bsNm), bsNm);
        return;
      }

      // default
      state.actionQueue.push({ type: "open", bsNm: bsNm, from });
      state.bsNmArr =
        option === "reset"
          ? [bsNm]
          : pushStack(removeFromStack(state.bsNmArr, bsNm), bsNm);
      return;
    },
    closeBS: (state, action: PayloadAction<{ bsNm: IBSNm; from?: string }>) => {
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
      action: PayloadAction<{ from?: string } | undefined>
    ) => {
      const from =
        action?.payload && typeof action.payload === "object"
          ? action.payload.from
          : undefined;
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
      console.log("[bottomSheetSlice/expandBS]", action.payload);
      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "expand") return;

      // if not current bs, do nothing
      const top = peekStack(state.bsNmArr);
      if (top !== action.payload.bsNm) return;

      // if already expanded, do nothing
      const snapPoints = bsConfigByName[action.payload.bsNm]?.snapPoints;
      const maxIndex = snapPoints ? snapPoints.length - 1 : 0;
      console.log("maxIndex:", maxIndex);
      if (state.currentValue.index > maxIndex) return;

      const { bsNm, from } = action.payload;
      state.actionQueue.push({ type: "expand", bsNm, from });
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
    setProductToAdd: (
      state,
      action: PayloadAction<(IProductData | IDietDetailProductData)[]>
    ) => {
      state.bsData.pToAdd = action.payload;
    },
    setProductToDel: (
      state,
      action: PayloadAction<(IProductData | IDietDetailProductData)[]>
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

    // lower shipping bottom sheet
    setLSQtyChange: (
      state,
      action: PayloadAction<{
        menuIdx: number;
      }>
    ) => {
      state.bsData.qtyChange.menuIdx = action.payload.menuIdx;
    },

    resetBSData: (state) => {
      state.bsData = initialState.bsData;
    },
  },
});

export const {
  setProductToAdd,
  setProductToDel,
  deleteBSProduct,
  resetBSData,
  openBS,
  closeBS,
  closeBSAll,
  closeBSWOAction,
  snapBS,
  expandBS,
  dequeueBSAction,
  resetBSActionQueue,
  setCurrentValue,
  // lower shipping bottom sheet
  setLSQtyChange,
} = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
