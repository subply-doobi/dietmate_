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
  | "productToDelSelect";

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
  // product select
  product: {
    add: (IProductData | IDietDetailProductData)[];
    del: (IProductData | IDietDetailProductData)[];
  };
}

const initialState: BottomSheetState = {
  bsNmArr: [],
  actionQueue: [],
  currentValue: { index: -1, position: 0 },
  // product select
  product: {
    add: [],
    del: [],
  },
};

const bottomSheetSlice = createSlice({
  name: "bottomSheet",
  initialState,
  reducers: {
    // bs action
    // payload 없는 경우 : 기존 bsNmArr[lastIdx] open
    // payload 있는 경우 : bsNmArr에 추가하거나 맨 뒤로 옮겨서 open
    openBS: (state, action: PayloadAction<IBSNm>) => {
      if (
        state.bsNmArr[state.bsNmArr.length - 1] === action.payload &&
        state.currentValue.index >= 0
      ) {
        return;
      }
      state.actionQueue.push({
        type: "open",
        bsNm: action.payload,
      });
    },

    // bsNm에 따라 bsConfig 변경되기 때문에 bs 닫히기 전에 config 변경되면 디자인 깨짐
    // closeBS의 경우에는 닫힌게 확인이 된 후 bsNm 제거
    // (GlobalBSM.tsx에서 actionQueue 처리 -> onChange 후에 bsNm 제거)
    closeBS: (state) => {
      if (state.actionQueue[state.actionQueue.length - 1]?.type === "close") {
        return;
      }
      state.actionQueue.push({
        type: "close",
      });
    },
    closeBSAll: (state) => {
      if (
        state.actionQueue[state.actionQueue.length - 1]?.type === "closeAll"
      ) {
        return;
      }
      state.actionQueue.push({
        type: "closeAll",
      });
    },
    addBSNm: (state, action: PayloadAction<IBSNm>) => {
      if (!state.bsNmArr.includes(action.payload)) {
        state.bsNmArr.push(action.payload);
        return;
      }

      const filteredArr = state.bsNmArr.filter(
        (name) => name !== action.payload
      );
      state.bsNmArr = [...filteredArr, action.payload];
    },
    removeBSNm: (state, action: PayloadAction<IBSNm>) => {
      const bsNm = action.payload;
      console.log("------ bsSlice removeBSNm: ", bsNm);
      state.bsNmArr = state.bsNmArr.filter((name) => name !== bsNm);
    },
    removeAllBsNm: (state) => {
      state.bsNmArr = [];
    },
    snapBS: (state, action: PayloadAction<{ index: number; bsNm: IBSNm }>) => {
      const { index, bsNm } = action.payload;
      state.actionQueue.push({ type: "snapToIndex", index, bsNm });
    },
    expandBS: (state, action: PayloadAction<{ bsNm: IBSNm }>) => {
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
      state.product.add = action.payload;
    },
    setProductToDel: (
      state,
      action: PayloadAction<(IProductData | IDietDetailProductData)[]>
    ) => {
      state.product.del = action.payload;
    },
    deleteBSProduct: (state) => {
      state.product = {
        add: [],
        del: [],
      };
    },
    setCurrentValue: (
      state,
      action: PayloadAction<{ index: number; position: number }>
    ) => {
      state.currentValue = action.payload;
    },
  },
});

export const {
  setProductToAdd,
  setProductToDel,
  deleteBSProduct,
  openBS,
  closeBS,
  closeBSAll,
  addBSNm,
  removeBSNm,
  removeAllBsNm,
  snapBS,
  expandBS,
  dequeueBSAction,
  resetBSActionQueue,
  setCurrentValue,
} = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
