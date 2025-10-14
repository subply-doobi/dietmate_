import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { IDietTotalObjData } from "../../shared/api/types/diet";

export interface IOrderState {
  selectedAddrIdx: number;
}

const initialState: IOrderState = {
  selectedAddrIdx: 0,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // foodToOrder
    setselectedAddrIdx: (state, action: PayloadAction<number>) => {
      state.selectedAddrIdx = action.payload;
    },
  },
});

export const { setselectedAddrIdx } = orderSlice.actions;
export default orderSlice.reducer;
