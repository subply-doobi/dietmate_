import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IProductData } from "../../shared/api/types/product";
import {
  categorizeFood,
  IFoodGroupForAutoMenu,
  separateFoods,
} from "../../shared/utils/dataTransform";
import { getMedianCalorie } from "../../shared/utils/sumUp";
import { IBSCompNm } from "@/components/bottomSheet/GlobalBSM";

const initialCategory = {
  lunchBox: [],
  chicken: [],
  salad: [],
  snack: [],
  chip: [],
  drink: [],
};

type ITutorialProgress =
  | ""
  | "Start"
  | "AddMenu"
  | "AddFood"
  | "SelectFood"
  | "AutoRemain"
  | "ChangeFood"
  | "AutoMenu"
  | "Complete";

export interface ICommonState {
  inset: {
    headerHeight: number;
    bottomTabBarHeight: number;
    insetTop: number;
  };
  globalLoading: boolean;
  bottomSheetName: string;
  currentDietNo: string;
  foodNeededArr: boolean[];
  totalFoodList: IProductData[];
  totalFoodListIsLoaded: boolean;
  foodGroupForAutoMenu: IFoodGroupForAutoMenu;
  medianCalorie: number;
  platformDDItems: { value: string; label: string }[];
  progressTooltipShow: boolean;
  menuAcActive: number[];
  isTutorialMode: boolean;
  tutorialProgress: ITutorialProgress;
  autoMenuStatus: {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
}

const initialState: ICommonState = {
  inset: {
    headerHeight: 91,
    bottomTabBarHeight: 49,
    insetTop: 0,
  },
  bottomSheetName: "",
  globalLoading: false,
  currentDietNo: "",
  foodNeededArr: [],
  totalFoodList: [],
  totalFoodListIsLoaded: false,
  foodGroupForAutoMenu: {
    total: initialCategory,
    normal: initialCategory,
    highCarb: initialCategory,
    highProtein: initialCategory,
    highFat: initialCategory,
  },
  medianCalorie: 0,
  platformDDItems: [{ value: "", label: "선택안함" }],
  progressTooltipShow: true,
  menuAcActive: [],
  isTutorialMode: false,
  tutorialProgress: "",
  autoMenuStatus: {
    isLoading: false,
    isSuccess: false,
    isError: false,
  },
};

export const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setInsets: (
      state,
      action: PayloadAction<{
        headerHeight?: number;
        bottomTabBarHeight?: number;
        insetTop?: number;
      }>
    ) => {
      state.inset = { ...state.inset, ...action.payload };
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    openBottomSheet: (state, action: PayloadAction<IBSCompNm>) => {
      state.bottomSheetName = action.payload;
    },
    closeBottomSheet: (state) => {
      state.bottomSheetName = "";
    },
    setCurrentDiet: (state, action: PayloadAction<string>) => {
      state.currentDietNo = action.payload;
      state.progressTooltipShow = true;
      // queryClient.invalidateQueries([PRODUCTS]);
    },
    setFoodNeededArr: (state, action: PayloadAction<boolean[]>) => {
      state.foodNeededArr = action.payload;
    },
    setTotalFoodList: (state, action: PayloadAction<IProductData[]>) => {
      state.totalFoodList = action.payload;
      state.medianCalorie = getMedianCalorie(action.payload);
      const { highCarbFood, highProtFood, highFatFood, normalFood } =
        separateFoods(action.payload);
      const foodGroupForAutoMenu: IFoodGroupForAutoMenu = {
        // REFACTOR 필요
        total: categorizeFood(action.payload),
        normal: categorizeFood(normalFood),
        highCarb: categorizeFood(highCarbFood),
        highProtein: categorizeFood(highProtFood),
        highFat: categorizeFood(highFatFood),
      };
      state.foodGroupForAutoMenu = foodGroupForAutoMenu;
      state.totalFoodListIsLoaded = true;

      // action.payload 의 platformNm을 기준으로 중복되지 않는 platformNm을 platformDDItems 형태의 배열로 만들기
      const platformNmSet = new Set(
        action.payload.map((product) => product.platformNm)
      );
      const platformNmArr = Array.from(platformNmSet);
      const platformDDItems = platformNmArr.map((platformNm) => ({
        value: platformNm,
        label: platformNm,
      }));
      state.platformDDItems = [
        ...[{ value: "", label: "선택안함" }],
        ...platformDDItems,
      ];
    },
    setMenuAcActive: (state, action: PayloadAction<number[]>) => {
      state.menuAcActive = action.payload;
    },
    setIsTutorialMode: (state, action: PayloadAction<boolean>) => {
      state.isTutorialMode = action.payload;
    },
    setTutorialProgress: (state, action: PayloadAction<ITutorialProgress>) => {
      state.tutorialProgress = action.payload;
    },
    setTutorialStart: (state) => {
      state.isTutorialMode = true;
      state.tutorialProgress = "Start";
    },
    setTutorialEnd: (state) => {
      state.isTutorialMode = false;
      state.tutorialProgress = "";
    },
    setAutoMenuStatus: (
      state,
      action: PayloadAction<{
        isLoading?: boolean;
        isSuccess?: boolean;
        isError?: boolean;
      }>
    ) => {
      state.autoMenuStatus = { ...state.autoMenuStatus, ...action.payload };
    },
  },
});

export const {
  setInsets,
  setGlobalLoading,
  openBottomSheet,
  closeBottomSheet,
  setCurrentDiet,
  setFoodNeededArr,
  setTotalFoodList,
  setMenuAcActive,
  setIsTutorialMode,
  setTutorialStart,
  setTutorialEnd,
  setTutorialProgress,
  setAutoMenuStatus,
} = commonSlice.actions;
export default commonSlice.reducer;
