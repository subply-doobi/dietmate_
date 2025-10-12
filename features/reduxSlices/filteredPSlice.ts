import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IProductData } from "@/shared/api/types/product";
import { IOrderedProduct } from "@/shared/api/types/order";
import { RootState, store } from "@/shared/store/reduxStore";

export interface sortFilterStateInClient {
  // 식품 목록
  screenNm?: string;
  totalFoodList: IProductData[]; // 전체
  availableFoods: IProductData[]; // 영양 목표 달성 가능
  recentOpenedFoodsPNoArr?: string[]; // 최근 열어본 식품
  recentlyOpenedFoods: IProductData[];
  recentlyOrderedFoods: IOrderedProduct[]; // 최근 주문 식품
  likedFoods: IProductData[]; // 좋아요 식품
  random3Foods: IProductData[]; // 랜덤으로 3개 식품
  // 필터링 상태
  filter: {
    baseListType: "totalFoodList" | "availableFoods";
    category: "" | "CG001" | "CG002" | "CG003" | "CG004" | "CG005" | "CG006";
    sortBy:
      | ""
      | "priceAsc"
      | "priceDesc"
      | "calorieAsc"
      | "calorieDesc"
      | "carbAsc"
      | "carbDesc"
      | "proteinAsc"
      | "proteinDesc"
      | "fatAsc"
      | "fatDesc"
      | "priceCalorieCompareAsc"
      | "priceCalorieCompareDesc"
      | "priceProteinCompareAsc"
      | "priceProteinCompareDesc";
    platformNm: string[];
    recentlyOpened: boolean;
    liked: boolean;
    recentlyOrdered: boolean;
    searchQuery: string;
    random3: boolean;
  };
  lastAppliedFilter: string;
  lastFilteredList: IProductData[]; // 마지막 필터링된 목록
}

const initialState: sortFilterStateInClient = {
  totalFoodList: [],
  availableFoods: [],
  recentlyOpenedFoods: [],
  recentlyOrderedFoods: [],
  likedFoods: [],
  random3Foods: [],
  filter: {
    baseListType: "availableFoods",
    category: "",
    sortBy: "",
    platformNm: [],
    recentlyOpened: false,
    liked: false,
    recentlyOrdered: false,
    searchQuery: "",
    random3: false,
  },
  lastAppliedFilter: "baseListType",
  lastFilteredList: [], // 마지막 필터링된 목록
};

const filteredPSlice = createSlice({
  name: "filteredProduct",
  initialState,
  reducers: {
    setAvailableFoods: (
      state,
      action: PayloadAction<{
        screenNm?: string;
        totalFoodList: IProductData[];
        availableFoods: IProductData[];
        recentOpenedFoodsPNoArr: string[];
        listOrderData: IOrderedProduct[];
        likeData: IProductData[];
      }>
    ) => {
      const isSearchScreen = action.payload.screenNm === "/Search";
      state.totalFoodList = action.payload.totalFoodList;
      state.availableFoods = isSearchScreen
        ? action.payload.totalFoodList
        : action.payload.availableFoods;
      state.recentOpenedFoodsPNoArr = action.payload.recentOpenedFoodsPNoArr;
      state.recentlyOrderedFoods = action.payload.listOrderData;
      state.likedFoods = action.payload.likeData;

      // random3
      const shuffled = [...state.availableFoods].sort(
        () => Math.random() - 0.5
      );
      state.random3Foods = shuffled.slice(0, 3);

      // 2. recentlyOpenedFoods: preserve order from recentOpenedFoodsPNoArr
      state.recentlyOpenedFoods = action.payload.recentOpenedFoodsPNoArr
        .map((productNo) =>
          state.availableFoods.find((p) => p.productNo === productNo)
        )
        .filter(Boolean) as IProductData[];

      // 3. likedFoods: from likeData
      state.likedFoods = (action.payload.likeData ?? []).filter((p) =>
        state.availableFoods.some((a) => a.productNo === p.productNo)
      );

      // 4. recentlyOrderedFoods: from listOrderData, preserve order
      state.recentlyOrderedFoods = (action.payload.listOrderData ?? []).filter(
        (o) => state.availableFoods.some((a) => a.productNo === o.productNo)
      );

      // 필터링 초기화
      state.filter = {
        baseListType:
          action.payload.availableFoods.length > 0
            ? "availableFoods"
            : "totalFoodList",
        category: "",
        sortBy: "",
        platformNm: [],
        recentlyOpened: false,
        liked: false,
        recentlyOrdered: false,
        searchQuery: "",
        random3: false,
      };
    },
    setRecentlyOpenedFoodsPNoArr: (state, action: PayloadAction<string[]>) => {
      state.recentOpenedFoodsPNoArr = action.payload;
    },
    setInitialSortFilter: (
      state,
      action: PayloadAction<Partial<sortFilterStateInClient["filter"]>>
    ) => {
      state.filter = {
        ...state.filter,
        ...action.payload,
      };
      state.lastAppliedFilter = "baseListType";
    },
    setBaseListType: (
      state,
      action: PayloadAction<"totalFoodList" | "availableFoods">
    ) => {
      state.filter.baseListType = action.payload;
      state.lastAppliedFilter = "baseListType";
    },
    setCategory: (
      state,
      action: PayloadAction<
        "" | "CG001" | "CG002" | "CG003" | "CG004" | "CG005" | "CG006"
      >
    ) => {
      state.filter.category = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<sortFilterStateInClient["filter"]["sortBy"]>
    ) => {
      state.filter.sortBy = action.payload;
      state.lastAppliedFilter = "sortBy";
    },
    setPlatformNm: (state, action: PayloadAction<string[]>) => {
      state.filter.platformNm = action.payload;
      state.lastAppliedFilter = "platformNm";
    },
    setRecentlyOpened: (state, action: PayloadAction<boolean>) => {
      state.filter.recentlyOpened = action.payload;
      state.lastAppliedFilter = "recentlyOpened";
    },
    setLiked: (state, action: PayloadAction<boolean>) => {
      state.filter.liked = action.payload;
      state.lastAppliedFilter = "liked";
    },
    setRecentlyOrdered: (state, action: PayloadAction<boolean>) => {
      state.filter.recentlyOrdered = action.payload;
      state.lastAppliedFilter = "recentlyOrdered";
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filter.searchQuery = action.payload;
      state.lastAppliedFilter = "searchQuery";
    },
    setRandom3: (state, action: PayloadAction<boolean>) => {
      state.filter.random3 = action.payload;
      state.lastAppliedFilter = "random3";
    },
    resetSortFilter: (
      state,
      action: PayloadAction<"availableFoods" | "totalFoodList">
    ) => {
      state.filter = {
        baseListType: action.payload,
        category: "",
        sortBy: "",
        platformNm: [],
        recentlyOpened: false,
        liked: false,
        recentlyOrdered: false,
        searchQuery: "",
        random3: false,
      };
      state.lastAppliedFilter = "availableFoods";
    },
    setLastFilteredList: (state, action: PayloadAction<IProductData[]>) => {
      state.lastFilteredList = action.payload;
    },
  },
});

// component 내에서 select 진행 한 후 lastFilteredList에 저장 필요
// lastFilteredList 저장 없으면 정렬 기능일때도 매번 필터링을 다시 진행
export const selectFilteredSortedProducts = createSelector(
  [
    (state: RootState) => state.common.totalFoodList,
    (state: RootState) => state.filteredProduct.availableFoods,
    (state: RootState) => state.filteredProduct.recentOpenedFoodsPNoArr,
    (state: RootState) => state.filteredProduct.likedFoods,
    (state: RootState) => state.filteredProduct.recentlyOrderedFoods,
    (state: RootState) => state.filteredProduct.lastAppliedFilter,
    (state: RootState) => state.filteredProduct.lastFilteredList,
    // filter state
    (state: RootState) => state.filteredProduct.filter.baseListType,
    (state: RootState) => state.filteredProduct.filter.category,
    (state: RootState) => state.filteredProduct.filter.searchQuery,
    (state: RootState) => state.filteredProduct.filter.platformNm,
    (state: RootState) => state.filteredProduct.filter.recentlyOpened,
    (state: RootState) => state.filteredProduct.filter.liked,
    (state: RootState) => state.filteredProduct.filter.recentlyOrdered,
    (state: RootState) => state.filteredProduct.filter.random3,
    (state: RootState) => state.filteredProduct.filter.sortBy,
  ],
  (
    totalFoodList,
    availableFoods,
    recentOpenedFoodsPNoArr, // string[]
    likeFoods,
    recentOrderFoods,
    lastAppliedFilter,
    lastFilteredList,
    // filter state
    baseListType,
    category,
    searchQuery,
    platformNm,
    recentlyOpened,
    liked,
    recentlyOrdered,
    random3,
    sortBy
  ) => {
    // 마지막에 sort 적용된 경우 다른 필터링 없이 정렬만 진행 후 return
    if (lastAppliedFilter === "sortBy" && lastFilteredList.length > 0) {
      const result = [...lastFilteredList];
      switch (sortBy) {
        case "priceAsc":
          result.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case "priceDesc":
          result.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case "calorieAsc":
          result.sort((a, b) => Number(a.calorie) - Number(b.calorie));
          break;
        case "calorieDesc":
          result.sort((a, b) => Number(b.calorie) - Number(a.calorie));
          break;
        case "carbAsc":
          result.sort((a, b) => Number(a.carb) - Number(b.carb));
          break;
        case "carbDesc":
          result.sort((a, b) => Number(b.carb) - Number(a.carb));
          break;
        case "proteinAsc":
          result.sort((a, b) => Number(a.protein) - Number(b.protein));
          break;
        case "proteinDesc":
          result.sort((a, b) => Number(b.protein) - Number(a.protein));
          break;
        case "fatAsc":
          result.sort((a, b) => Number(a.fat) - Number(b.fat));
          break;
        case "fatDesc":
          result.sort((a, b) => Number(b.fat) - Number(a.fat));
          break;
        case "priceCalorieCompareAsc":
          result.sort(
            (a, b) =>
              Number(a.price) / Number(a.calorie) -
              Number(b.price) / Number(b.calorie)
          );
          break;
        case "priceCalorieCompareDesc":
          result.sort(
            (a, b) =>
              Number(b.price) / Number(b.calorie) -
              Number(a.price) / Number(a.calorie)
          );
          break;
        case "priceProteinCompareAsc":
          result.sort(
            (a, b) =>
              Number(a.price) / Number(a.protein) -
              Number(b.price) / Number(b.protein)
          );
          break;
        case "priceProteinCompareDesc":
          result.sort(
            (a, b) =>
              Number(b.price) / Number(b.protein) -
              Number(a.price) / Number(a.protein)
          );
          break;
        default:
          break;
      }
      return result;
    }

    // Choose base list
    let result =
      baseListType === "availableFoods"
        ? [...availableFoods]
        : [...totalFoodList];

    // Filtering
    if (category !== "") {
      result = result.filter((p) => p.categoryCd === category);
    }

    if (platformNm.length > 0) {
      result = result.filter((p) => platformNm.includes(p.platformNm));
    }
    if (recentlyOpened && Array.isArray(recentOpenedFoodsPNoArr)) {
      // const ids = new Set(recentOpenedFoodsPNoArr);
      // result = result.filter((p) => ids.has(p.productNo));
      result = recentOpenedFoodsPNoArr
        .map((productNo) => result.find((p) => p.productNo === productNo))
        .filter(Boolean) as IProductData[];
    }
    if (liked && Array.isArray(likeFoods)) {
      const ids = new Set(likeFoods.map((p) => p.productNo));
      result = result.filter((p) => ids.has(p.productNo));
    }
    if (recentlyOrdered && Array.isArray(recentOrderFoods)) {
      const orderNos = recentOrderFoods.map((o) => o.productNo);
      result = orderNos
        .map((productNo) => result.find((p) => p.productNo === productNo))
        .filter(Boolean) as IProductData[];
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.productNm?.toLowerCase().includes(q) ||
          p.platformNm?.toLowerCase().includes(q)
      );
    }
    if (random3) {
      const shuffled = result.sort(() => 0.5 - Math.random());
      result = shuffled.slice(0, 3);
    }

    // Sorting
    switch (sortBy) {
      case "priceAsc":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "priceDesc":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "calorieAsc":
        result.sort((a, b) => Number(a.calorie) - Number(b.calorie));
        break;
      case "calorieDesc":
        result.sort((a, b) => Number(b.calorie) - Number(a.calorie));
        break;
      case "carbAsc":
        result.sort((a, b) => Number(a.carb) - Number(b.carb));
        break;
      case "carbDesc":
        result.sort((a, b) => Number(b.carb) - Number(a.carb));
        break;
      case "proteinAsc":
        result.sort((a, b) => Number(a.protein) - Number(b.protein));
        break;
      case "proteinDesc":
        result.sort((a, b) => Number(b.protein) - Number(a.protein));
        break;
      case "fatAsc":
        result.sort((a, b) => Number(a.fat) - Number(b.fat));
        break;
      case "fatDesc":
        result.sort((a, b) => Number(b.fat) - Number(a.fat));
        break;
      case "priceCalorieCompareAsc":
        result.sort(
          (a, b) =>
            Number(a.price) / Number(a.calorie) -
            Number(b.price) / Number(b.calorie)
        );
        break;
      case "priceCalorieCompareDesc":
        result.sort(
          (a, b) =>
            Number(b.price) / Number(b.calorie) -
            Number(a.price) / Number(a.calorie)
        );
        break;
      case "priceProteinCompareAsc":
        result.sort(
          (a, b) =>
            Number(a.price) / Number(a.protein) -
            Number(b.price) / Number(b.protein)
        );
        break;
      case "priceProteinCompareDesc":
        result.sort(
          (a, b) =>
            Number(b.price) / Number(b.protein) -
            Number(a.price) / Number(a.protein)
        );
        break;
      default:
        break;
    }
    return result;
  }
);

export const {
  setAvailableFoods,
  setRecentlyOpenedFoodsPNoArr,
  setInitialSortFilter,
  setBaseListType,
  setCategory,
  setSortBy,
  setPlatformNm,
  setRecentlyOpened,
  setLiked,
  setRecentlyOrdered,
  setSearchQuery,
  setRandom3,
  resetSortFilter,
  setLastFilteredList,
} = filteredPSlice.actions;
export default filteredPSlice.reducer;
