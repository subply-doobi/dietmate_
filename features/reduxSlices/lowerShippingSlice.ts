import { IProductData } from "@/shared/api/types/product";
import { MenuWithChangeAvailableFoods } from "@/shared/utils/screens/lowerShipping/changeAvailable";
import { IShippingPriceObj, IShippingPriceValues } from "@/shared/utils/sumUp";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ILowerShippingState {
  toastType: "foodChange" | "qtyChange" | "";
  toastData: {
    foodChange: {
      menuWithChangeAvailableFoods: MenuWithChangeAvailableFoods;
      productToDel: IProductData | undefined;
      productToAdd: IProductData | undefined;
    };
    qtyChange: {
      menuIdx: number;
    };
  };
}

const initialState: ILowerShippingState = {
  toastType: "",
  toastData: {
    foodChange: {
      menuWithChangeAvailableFoods: {
        index: 0,
        changeAvailableFoods: {},
        dietDetailData: [],
        currentDietPrice: 0,
        currentDietSellerPrice: 0,
      },
      productToDel: undefined,
      productToAdd: undefined,
    },
    qtyChange: { menuIdx: 0 },
  },
};

const lowerShippingSlice = createSlice({
  name: "lowerShipping",
  initialState,
  reducers: {
    setFoodChangeToast: (
      state,
      action: PayloadAction<{
        menuWithChangeAvailableFoods: MenuWithChangeAvailableFoods;
      }>
    ) => {
      state.toastType = "foodChange";
      state.toastData.foodChange.menuWithChangeAvailableFoods =
        action.payload.menuWithChangeAvailableFoods;
    },
    setQtyChangeToast: (
      state,
      action: PayloadAction<{
        menuIdx: number;
      }>
    ) => {
      state.toastType = "qtyChange";
      state.toastData.qtyChange.menuIdx = action.payload.menuIdx;
      state.toastData.foodChange.productToDel = undefined;
      state.toastData.foodChange.productToAdd = undefined;
    },
    setProductToDel: (
      state,
      action: PayloadAction<IProductData | undefined>
    ) => {
      state.toastData.foodChange.productToDel = action.payload;
      state.toastData.foodChange.productToAdd = undefined;
    },
    setProductToAdd: (
      state,
      action: PayloadAction<IProductData | undefined>
    ) => {
      state.toastData.foodChange.productToAdd = action.payload;
    },
    onLowerShippingTHide: (state) => {
      state.toastType = "";
      state.toastData = initialState.toastData;
    },
  },
});

export const {
  setFoodChangeToast,
  setQtyChangeToast,
  onLowerShippingTHide,
  setProductToDel,
  setProductToAdd,
} = lowerShippingSlice.actions;
export default lowerShippingSlice.reducer;
