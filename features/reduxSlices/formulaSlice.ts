import { IProductData } from "@/shared/api/types/product";
import { IAutoMenuSubPageNm } from "@/shared/utils/screens/autoMenu/contentByPages";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type IFormulaProgress = Array<
  "SelectNumOfMenu" | "SelectMethod" | "Formula" | IAutoMenuSubPageNm
>;

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
