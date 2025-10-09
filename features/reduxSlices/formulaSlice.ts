import { IProductData } from "@/shared/api/types/product";
import { IFormulaPageNm } from "@/shared/utils/screens/formula/contentByPages";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type IFormulaProgress = Array<IFormulaPageNm>;

export type ICarouselAction =
  | { type: "scrollTo"; index: number; animated?: boolean; from?: string }
  | { type: "scrollToNext"; animated?: boolean; from?: string }
  | { type: "scrollToPrev"; animated?: boolean; from?: string };

export interface IFormulaState {
  currentFMCIdx: number;
  formulaProgress: IFormulaProgress;
  autoAddFoodForAdd: IProductData | undefined;
  autoAddFoodForChange: IProductData | undefined;
  carouselActionQueue: ICarouselAction[];
}

const initialState: IFormulaState = {
  currentFMCIdx: 0,
  formulaProgress: [],
  autoAddFoodForAdd: undefined,
  autoAddFoodForChange: undefined,
  carouselActionQueue: [],
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

    // Carousel scroll actions
    scrollCarouselTo: (
      state,
      action: PayloadAction<{
        index: number;
        animated?: boolean;
        from?: string;
      }>
    ) => {
      const { index, animated = true, from } = action.payload;
      state.carouselActionQueue.push({
        type: "scrollTo",
        index,
        animated,
        from,
      });
    },
    scrollCarouselNext: (
      state,
      action: PayloadAction<{ animated?: boolean; from?: string } | undefined>
    ) => {
      const { animated = true, from } = action.payload || {};
      state.carouselActionQueue.push({ type: "scrollToNext", animated, from });
    },
    scrollCarouselPrev: (
      state,
      action: PayloadAction<{ animated?: boolean; from?: string } | undefined>
    ) => {
      const { animated = true, from } = action.payload || {};
      state.carouselActionQueue.push({ type: "scrollToPrev", animated, from });
    },
    dequeueCarouselAction: (state) => {
      if (state.carouselActionQueue.length > 0) {
        state.carouselActionQueue.shift();
      }
    },
    resetCarouselActionQueue: (state) => {
      state.carouselActionQueue = [];
    },
  },
});

export const {
  setCurrentFMCIdx,
  setFormulaProgress,
  setAutoAddFood,
  scrollCarouselTo,
  scrollCarouselNext,
  scrollCarouselPrev,
  dequeueCarouselAction,
  resetCarouselActionQueue,
} = formulaSlice.actions;
export default formulaSlice.reducer;
