import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SettingProgressNm = "AMCategory" | "AMCompany" | "AMPrice";
interface AutoMenuState {
  settingProgress: SettingProgressNm[];
  selectedDietNo: string[];
  selectedCategory: boolean[];
  wantedCompany: string;
  priceSliderValue: number[];
}

const initialState: AutoMenuState = {
  settingProgress: [],
  selectedDietNo: [],
  selectedCategory: [],
  wantedCompany: "",
  priceSliderValue: [6000, 12000],
};

const autoMenuSlice = createSlice({
  name: "autoMenu",
  initialState,
  reducers: {
    setAMSettingProgress(state, action: PayloadAction<SettingProgressNm[]>) {
      state.settingProgress = action.payload;
    },
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
  setAMSettingProgress,
  setSelectedDietNo,
  setSelectedCategory,
  setWantedCompany,
  setPriceSliderValue,
} = autoMenuSlice.actions;

export default autoMenuSlice.reducer;
