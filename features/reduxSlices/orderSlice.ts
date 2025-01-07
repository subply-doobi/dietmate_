import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { IDietTotalObjData } from "../../shared/api/types/diet";

export interface IOrderState {
  // 제조사별 식품리스트
  foodToOrder: IDietTotalObjData;
  selectedAddrIdx: number;
  shippingPrice: number;
}

const initialState: IOrderState = {
  foodToOrder: {},
  selectedAddrIdx: 0,
  shippingPrice: 0,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // foodToOrder
    setFoodToOrder: (state, action: PayloadAction<IDietTotalObjData>) => {
      state.foodToOrder = action.payload;
    },
    setselectedAddrIdx: (state, action: PayloadAction<number>) => {
      state.selectedAddrIdx = action.payload;
    },
    setShippingPrice: (state, action: PayloadAction<number>) => {
      state.shippingPrice = action.payload;
    },
  },
});

export const { setFoodToOrder, setselectedAddrIdx, setShippingPrice } =
  orderSlice.actions;
export default orderSlice.reducer;
