import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FILTER_BTN_RANGE, NUTR_ERROR_RANGE } from "../../shared/constants";
import { IDietDetailData } from "../../shared/api/types/diet";
import { IBaseLineData } from "../../shared/api/types/baseLine";
import { sumUpNutrients } from "../../shared/utils/sumUp";

const sortTextSeq = ["", "ASC", "DESC"];

const findIdxOfFilterBtn = (btnType: string) => {
  return FILTER_BTN_RANGE.findIndex((btn) => btn.name === btnType);
};

// 현재 눌려있는 버튼에 따라 버튼 범위 가져오기
const getRange = (btnType: string, btn: number[]) => {
  // 버튼 1개
  if (btn.length === 1) {
    const nutrRange =
      FILTER_BTN_RANGE[findIdxOfFilterBtn(btnType)].value[btn[0]];
    return [nutrRange[0], nutrRange[1]];
  }

  // 버튼 2개
  if (btn.length === 2) {
    const nutrRange1 =
      FILTER_BTN_RANGE[findIdxOfFilterBtn(btnType)].value[btn[0]];
    const nutrRange2 =
      FILTER_BTN_RANGE[findIdxOfFilterBtn(btnType)].value[btn[1]];
    return [nutrRange1[0], nutrRange2[1]];
  }

  // 버튼 0개
  return [];
};

export interface ISortFilter {
  sort: {
    [key: string]: string;
    calorie: "" | "ASC" | "DESC";
    carb: "" | "ASC" | "DESC";
    protein: "" | "ASC" | "DESC";
    fat: "" | "ASC" | "DESC";
    price: "" | "ASC" | "DESC";
    priceCalorieCompare: "" | "ASC" | "DESC";
    priceProteinCompare: "" | "ASC" | "DESC";
  };
  filter: {
    category: string;
    selectedBtn: {
      [key: string]: number[];
      calorie: number[];
      carb: number[];
      protein: number[];
      fat: number[];
      price: number[];
    };
    nutrition: {
      [key: string]: number[];
      calorie: number[];
      carb: number[];
      protein: number[];
      fat: number[];
    };
    price: number[];
    search: string;
  };
  selectedFilter?: number; // 0: 카테고리 | 1: 영양성분 | 2: 가격
}

// !!!! 필터가 바뀔 때 실시간으로 적용되면 안되고
// 필터를 수정하다가 취소된 경우에는 필터가 적용되면 안되기 때문에
// 1. 필터 값을 사용해서 api 요청할 때는 applied로 2. 필터를 조정할 때는 copied로 사용
// 필터 조정 후 확인 누를 때 copied => applied로 복사
// 필터 bottomsheet 열릴 때 applied => copied로 복사해서 사용
// (copied로 수정했는데 확인 안누르고 취소된경우 => 다음 bottomSheet 열 때 applied된 것만 불러와야함)
export const initialState: {
  applied: ISortFilter;
  copied: ISortFilter;
} = {
  applied: {
    sort: {
      calorie: "",
      carb: "",
      protein: "",
      fat: "",
      price: "",
      priceCalorieCompare: "",
      priceProteinCompare: "",
    },
    filter: {
      category: "",
      selectedBtn: {
        calorie: [],
        carb: [],
        protein: [],
        fat: [],
        price: [],
      },
      nutrition: {
        calorie: [],
        carb: [],
        protein: [],
        fat: [],
      },
      price: [],
      search: "",
    },
    selectedFilter: 0,
  },
  copied: {
    sort: {
      calorie: "",
      carb: "",
      protein: "",
      fat: "",
      price: "",
      priceCalorieCompare: "",
      priceProteinCompare: "",
    },
    filter: {
      category: "",
      selectedBtn: {
        calorie: [],
        carb: [],
        protein: [],
        fat: [],
        price: [],
      },
      nutrition: {
        calorie: [],
        carb: [],
        protein: [],
        fat: [],
      },
      price: [],
      search: "",
    },
    selectedFilter: 0,
  },
};

const sortFilterSlice = createSlice({
  name: "sortFilter",
  initialState,
  reducers: {
    // 정렬
    updateSort: (state, action: PayloadAction<string>) => {
      const currentSortIdx = sortTextSeq.findIndex(
        (v) => v === state.copied.sort[action.payload]
      );
      const nextSortIdx = (currentSortIdx + 1) % 3;

      // 정렬은 하나만 선택 가능 -> 초기상태에 하나만 적용
      state.copied.sort = {
        ...initialState.copied.sort,
        [action.payload]: sortTextSeq[nextSortIdx],
      };
    },
    initializeSort: (state) => {
      state.copied.sort = initialState.copied.sort;
    },

    // 현재 선택된 필터
    changeSelectedFilter: (
      state,
      action: PayloadAction<ISortFilter["selectedFilter"]>
    ) => {
      state.copied.selectedFilter = action.payload;
      // state.applied.selectedFilter = action.payload;
    },

    // 남은영양 이하
    // 필터 적용 후 영양성분 필터에 버튼 어떤 게 눌려있는지도 적용되어야하기 때문에
    // state.copied.filter.nutrition 뿐만아니라 selectedBtn도 함께 업데이트
    setFilterByRemainNutr: (
      state,
      action: PayloadAction<{
        baseLineData: IBaseLineData | undefined;
        dietDetailData: IDietDetailData | undefined;
      }>
    ) => {
      const { baseLineData, dietDetailData } = action.payload;
      if (baseLineData === undefined || dietDetailData === undefined) return;

      const { cal, carb, protein, fat } = sumUpNutrients(dietDetailData);

      // 남은 각 영양
      let calRemain =
        parseInt(baseLineData?.calorie, 10) - cal + NUTR_ERROR_RANGE.calorie[1];
      if (calRemain < 0) calRemain = 0;

      let carbRemain =
        parseInt(baseLineData?.carb, 10) - carb + NUTR_ERROR_RANGE.carb[1];
      if (carbRemain < 0) carbRemain = 0;

      let proteinRemain =
        parseInt(baseLineData?.protein, 10) -
        protein +
        NUTR_ERROR_RANGE.protein[1];
      if (proteinRemain < 0) proteinRemain = 0;

      let fatRemain =
        parseInt(baseLineData?.fat, 10) - fat + NUTR_ERROR_RANGE.fat[1];
      if (fatRemain < 0) fatRemain = 0;

      // 위 영양성분에 따라 어떤 버튼이 눌려있게 할 것인지도 고려
      const calBtnIdx = FILTER_BTN_RANGE[0].value.findIndex(
        (v) => v[0] <= calRemain && calRemain < v[1]
      );
      const carbBtnIdx = FILTER_BTN_RANGE[1].value.findIndex(
        (v) => v[0] <= carbRemain && carbRemain < v[1]
      );
      const proteinBtnIdx = FILTER_BTN_RANGE[2].value.findIndex(
        (v) => v[0] <= proteinRemain && proteinRemain < v[1]
      );
      const fatBtnIdx = FILTER_BTN_RANGE[3].value.findIndex(
        (v) => v[0] <= fatRemain && fatRemain < v[1]
      );

      // state 업데이트
      state.applied.filter.nutrition = {
        calorie: [0, calRemain],
        carb: [0, carbRemain],
        protein: [0, proteinRemain],
        fat: [0, fatRemain],
      };
      state.applied.filter.selectedBtn = {
        price: state.applied.filter.selectedBtn.price,
        calorie: calRemain === 0 ? [] : [0, calBtnIdx],
        carb: carbRemain === 0 ? [] : [0, carbBtnIdx],
        protein: proteinRemain === 0 ? [] : [0, proteinBtnIdx],
        fat: fatRemain === 0 ? [] : [0, fatBtnIdx],
      };
    },

    // 카테고리
    updateCategory: (state, action: PayloadAction<string>) => {
      state.copied.filter.category = action.payload;
    },
    initializeCategory: (state) => {
      state.copied.filter.category = initialState.copied.filter.category;
    },

    // 검색
    updateSearch: (state, action: PayloadAction<string>) => {
      state.copied.filter.search = action.payload;
    },
    initializeSearch: (state) => {
      state.copied.filter.search = initialState.copied.filter.search;
    },

    // 영양성분
    updateSelectedBtn: (
      state,
      action: PayloadAction<{ [key: string]: number }>
    ) => {
      const btnType = Object.keys(action.payload)[0];
      const btnIdx = Object.values(action.payload)[0];
      const currentState = state.copied.filter.selectedBtn;

      // 버튼 선택이 0개 or 2개일 때 => 초기화 후 선택 => 범위 저장
      if (currentState[btnType].length !== 1) {
        // 초기화
        state.copied.filter.selectedBtn[btnType] =
          initialState.copied.filter.selectedBtn[btnType];
        // 선택
        state.copied.filter.selectedBtn[btnType] = [btnIdx];
        // 범위 저장
        const range = getRange(btnType, [btnIdx]);
        btnType === "price"
          ? (state.copied.filter.price = range)
          : (state.copied.filter.nutrition[btnType] = range);
        return;
      }

      // 버튼 선택이 1개일 때 => 같은 버튼이면 제거 / 다른 버튼이면 추가 => 범위 저장
      if (currentState[btnType].length === 1) {
        const btnMod =
          // 같은버튼이면 제거
          currentState[btnType][0] === btnIdx
            ? []
            : // 다른버튼이면 추가
            state.copied.filter.selectedBtn[btnType][0] < btnIdx
            ? [state.copied.filter.selectedBtn[btnType][0], btnIdx]
            : [btnIdx, state.copied.filter.selectedBtn[btnType][0]];

        state.copied.filter.selectedBtn[btnType] = btnMod;

        //범위 저장
        const range = getRange(btnType, btnMod);
        btnType === "price"
          ? (state.copied.filter.price = range)
          : (state.copied.filter.nutrition[btnType] = range);

        return;
      }
    },
    initializeNutrition: (state) => {
      state.copied.filter.selectedBtn = {
        ...state.copied.filter.selectedBtn,
        calorie: [],
        carb: [],
        protein: [],
        fat: [],
      };
      state.copied.filter.nutrition = initialState.copied.filter.nutrition;
    },
    initializePrice: (state) => {
      state.copied.filter.selectedBtn = {
        ...state.copied.filter.selectedBtn,
        price: [],
      };
      state.copied.filter.price = initialState.copied.filter.price;
    },

    // 필터 전체 초기화
    initializeFilter: (state) => {
      state.copied.filter = initialState.copied.filter;
    },

    // 필터 정렬 모두 초기화
    initializeSortFilter: (state) => {
      state.applied = initialState.applied;
      state.copied = initialState.copied;
    },

    // copied => applied 로 복사 (필터 적용)
    applySortFilter: (state) => {
      state.applied = state.copied;
    },
    // applied => copied 로 복사 (적용된 필터 불러오기)
    copySortFilter: (state) => {
      state.copied = state.applied;
    },
  },
});

export const {
  updateSort,
  initializeSort,

  setFilterByRemainNutr,

  updateCategory,
  initializeCategory,

  updateSelectedBtn,
  initializeNutrition,
  initializePrice,

  updateSearch,
  initializeSearch,

  initializeFilter,
  initializeSortFilter,

  changeSelectedFilter,

  applySortFilter,
  copySortFilter,
} = sortFilterSlice.actions;
export default sortFilterSlice.reducer;
