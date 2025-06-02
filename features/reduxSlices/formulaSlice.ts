import { IProductData } from "@/shared/api/types/product";
import { IFormulaPageNm } from "@/shared/utils/screens/formula/contentByPages";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type IFormulaProgress = Array<IFormulaPageNm>;

export interface IFormulaState {
  currentFMCIdx: number;
  formulaProgress: IFormulaProgress;
  autoAddFoodForAdd: IProductData | undefined;
  autoAddFoodForChange: IProductData | undefined;
}

const initialState: IFormulaState = {
  currentFMCIdx: 0,
  formulaProgress: [],
  autoAddFoodForAdd: undefined,
  autoAddFoodForChange: undefined,
};

const formulaSlice = createSlice({
  name: "formula",
  initialState,
  reducers: {
    setCurrentFMCIdx: (state, action: PayloadAction<number>) => {
      state.currentFMCIdx = action.payload;
    },
    setFormulaProgress: (state, action: PayloadAction<IFormulaProgress>) => {
      state.formulaProgress = action.payload;
    },
    setAutoAddFood: (
      state,
      action: PayloadAction<{
        foodForAdd?: IProductData;
        foodForChange?: IProductData;
      }>
    ) => {
      state.autoAddFoodForAdd = action.payload.foodForAdd;
      state.autoAddFoodForChange = action.payload.foodForChange;
    },
  },
});

export const { setCurrentFMCIdx, setFormulaProgress, setAutoAddFood } =
  formulaSlice.actions;
export default formulaSlice.reducer;
