import { IProductData } from "@/shared/api/types/product";
import { IFormulaPageNm } from "@/shared/utils/screens/formula/contentByPages";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type IFormulaProgress = Array<IFormulaPageNm>;

export interface IFormulaState {
  currentFMCIdx: number;
  formulaProgress: IFormulaProgress;
  autoAddSelectedFood: IProductData | undefined;
}

const initialState: IFormulaState = {
  currentFMCIdx: 0,
  formulaProgress: [],
  autoAddSelectedFood: undefined,
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
    setAutoAddSelectedFood: (
      state,
      action: PayloadAction<IProductData | undefined>
    ) => {
      state.autoAddSelectedFood = action.payload;
    },
  },
});

export const { setCurrentFMCIdx, setFormulaProgress, setAutoAddSelectedFood } =
  formulaSlice.actions;
export default formulaSlice.reducer;
