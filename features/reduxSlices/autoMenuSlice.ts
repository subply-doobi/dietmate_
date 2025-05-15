import { IAutoMenuSubPageNm } from "@/shared/utils/screens/autoMenu/contentByPages";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AutoMenuState {
  selectedDietNo: string[];
  selectedCategory: boolean[];
  wantedCompany: string;
  priceSliderValue: number[];
}

const initialState: AutoMenuState = {
  selectedDietNo: [],
  selectedCategory: [],
  wantedCompany: "",
  priceSliderValue: [6000, 12000],
};

const autoMenuSlice = createSlice({
  name: "autoMenu",
  initialState,
  reducers: {
    setSelectedDietNo(state, action: PayloadAction<string[]>) {
      state.selectedDietNo = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<boolean[]>) {
      state.selectedCategory = action.payload;
    },
    setWantedCompany(state, action: PayloadAction<string>) {
      state.wantedCompany = action.payload;
    },
    setPriceSliderValue(state, action: PayloadAction<number[]>) {
      state.priceSliderValue = action.payload;
    },
  },
});

export const {
  setSelectedDietNo,
  setSelectedCategory,
  setWantedCompany,
  setPriceSliderValue,
} = autoMenuSlice.actions;

export default autoMenuSlice.reducer;
