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
  // lower shipping
  | "QtyChange";

export type IBSAction =
  | { type: "open"; bsNm: IBSNm }
  | { type: "close"; bsNm?: IBSNm }
  | { type: "closeAll" }
  | { type: "snapToIndex"; index: number; bsNm: IBSNm }
  | { type: "expand"; bsNm: IBSNm };

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
    openBS: (state, action: PayloadAction<IBSNm>) => {
      const target = action.payload;
      const top = peekStack(state.bsNmArr);
      const isOpen = state.currentValue.index >= 0;
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      // if duplicate action, do nothing
      if (
        lastAction?.type === "open" &&
        "bsNm" in lastAction &&
        lastAction.bsNm === target
      ) {
        return;
      }

      // If already open, do nothing
      if (top === target && isOpen) return;

      // If another is open, queue close and open
      if (isOpen && state.bsNmArr.length > 0) {
        state.actionQueue.push({ type: "close", bsNm: top });
        state.actionQueue.push({ type: "open", bsNm: target });
        state.bsNmArr = pushStack(
          removeFromStack(state.bsNmArr, target),
          target
        );
        return;
      }

      // If exists but not open
      if (top === target && !isOpen) {
        state.actionQueue.push({ type: "open", bsNm: target });
        return;
      }

      // If exists under different bs but not open
      if (state.bsNmArr.includes(target) && !isOpen) {
        state.bsNmArr = pushStack(
          removeFromStack(state.bsNmArr, target),
          target
        );
        state.actionQueue.push({ type: "open", bsNm: target });
        return;
      }

      // If doesn't exist and not open
      if (!isOpen) {
        state.actionQueue.push({ type: "open", bsNm: target });
        state.bsNmArr = pushStack(state.bsNmArr, target);
        return;
      }
    },
    closeBS: (state) => {
      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "close") return;

      const isOpen = state.currentValue.index >= 0;
      // If not open, do nothing
      if (!isOpen) return;
      if (state.bsNmArr.length === 0) return;

      // If only one is open
      if (state.bsNmArr.length === 1) {
        state.bsNmArr = [];
        state.actionQueue.push({ type: "close" });
        return;
      }

      // If multiple are open, close the top and open the one below
      const top = peekStack(state.bsNmArr);
      state.bsNmArr = removeFromStack(state.bsNmArr, top);
      state.actionQueue.push({ type: "close" });
      state.actionQueue.push({ type: "open", bsNm: peekStack(state.bsNmArr)! });
    },
    closeBSAll: (state) => {
      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "closeAll") return;
      const isOpen = state.currentValue.index >= 0;
      state.bsNmArr = [];
      if (!isOpen) return;
      state.actionQueue.push({ type: "closeAll" });
    },
    closeBSWOAction: (state) => {
      const top = peekStack(state.bsNmArr);
      console.log("closeBSWOAction: ", { top, bsNmArr: state.bsNmArr });
      state.bsNmArr = removeFromStack(state.bsNmArr, top);
      state.bsNmArr.length > 0 &&
        state.actionQueue.push({
          type: "open",
          bsNm: peekStack(state.bsNmArr)!,
        });
    },
    snapBS: (state, action: PayloadAction<{ index: number; bsNm: IBSNm }>) => {
      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "snapToIndex") return;

      // if already at the target index, do nothing
      const { index, bsNm } = action.payload;
      const isOpen = state.currentValue.index >= 0;
      const isCurrentBs = peekStack(state.bsNmArr) === bsNm;
      const isAtIndex = state.currentValue.index === index;
      if (isOpen && isCurrentBs && isAtIndex) return;

      state.actionQueue.push({ type: "snapToIndex", index, bsNm });
    },
    expandBS: (state, action: PayloadAction<{ bsNm: IBSNm }>) => {
      // if duplicate action, do nothing
      const lastAction = state.actionQueue[state.actionQueue.length - 1];
      if (lastAction?.type === "expand") return;

      // if already expanded, do nothing
      const snapPoints = bsConfigByName[action.payload.bsNm]?.snapPoints;
      const maxIndex = snapPoints ? snapPoints.length - 1 : 0;
      if (state.currentValue.index === maxIndex) return;

      const { bsNm } = action.payload;
      state.actionQueue.push({ type: "expand", bsNm });
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
