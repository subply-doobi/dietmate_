import { IDietDetailProductData } from "@/shared/api/types/diet";
import { IProductData, IProductDetailData } from "@/shared/api/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type IBSNm =
  | "none"
  // sort and filter
  | "baseListTypeFilter"
  | "categoryFilter"
  | "platformFilter"
  | "sort"
  // product select
  | "productToAddSelect"
  | "productToDelSelect";

type bsAction =
  | { type: "close" }
  | { type: "collapse" }
  | { type: "dismiss" }
  | { type: "expand" }
  | { type: "forceClose" }
  | { type: "present" }
  | { type: "snapToIndex"; index: number }
  | { type: "snapToPosition"; position: number };

interface BottomSheetState {
  bsNm: IBSNm;
  bsAction: bsAction | undefined;
  currentValue: { index: number; position: number };
  // product select
  product: {
    add: (IProductData | IDietDetailProductData)[];
    del: (IProductData | IDietDetailProductData)[];
  };
}

const initialState: BottomSheetState = {
  bsNm: "none",
  bsAction: undefined,
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
    openBottomSheet: (state, action: PayloadAction<IBSNm>) => {
      state.bsNm = action.payload;
    },
    closeBottomSheet: (state) => {
      // state.bsNm === "productSelect" && (state.product.add = undefined);
      state.bsNm = "none";
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
    setBSAction: (state, action: PayloadAction<bsAction>) => {
      state.bsAction = action.payload;
    },
    clearBSAction: (state) => {
      state.bsAction = undefined;
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
  openBottomSheet,
  closeBottomSheet,
  setProductToAdd,
  setProductToDel,
  deleteBSProduct,
  setBSAction,
  clearBSAction,
  setCurrentValue,
} = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
