import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IProductData } from "@/shared/api/types/product";
import { IOrderedProduct } from "@/shared/api/types/order";
import { RootState, store } from "@/shared/store/reduxStore";

export interface sortFilterStateInClient {
  // 식품 목록
  totalFoodList: IProductData[]; // 전체
  availableFoods: IProductData[]; // 영양 목표 달성 가능
  recentOrderFoods?: IOrderedProduct[]; // 최근 주문 식품
  recentOpenedFoodsPNoArr?: string[]; // 최근 열어본 식품
  likeFoods?: IProductData[]; // 좋아요 식품
  // 필터링 상태
  filter: {
    baseListType: "totalFoodList" | "availableFoods";
    sortBy: "priceAsc" | "priceDesc" | null;
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
  filter: {
    baseListType: "availableFoods",
    sortBy: null,
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
        totalFoodList: IProductData[];
        availableFoods: IProductData[];
        recentOpenedFoodsPNoArr: string[];
        listOrderData?: IOrderedProduct[];
        likeData?: IProductData[];
      }>
    ) => {
      state.totalFoodList = action.payload.totalFoodList;
      state.availableFoods = action.payload.availableFoods;
      state.recentOpenedFoodsPNoArr = action.payload.recentOpenedFoodsPNoArr;
      state.recentOrderFoods = action.payload.listOrderData;
      state.likeFoods = action.payload.likeData;
      // 필터링 초기화
      state.filter = {
        baseListType: "availableFoods",
        sortBy: null,
        platformNm: [],
        recentlyOpened: false,
        liked: false,
        recentlyOrdered: false,
        searchQuery: "",
        random3: false,
      };
    },
    setBaseListType: (
      state,
      action: PayloadAction<"totalFoodList" | "availableFoods">
    ) => {
      state.filter.baseListType = action.payload;
      state.lastAppliedFilter = "baseListType";
    },
    setSortBy: (
      state,
      action: PayloadAction<"priceAsc" | "priceDesc" | null>
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
    resetSortFilter: (state) => {
      state.filter = {
        baseListType: "availableFoods",
        sortBy: null,
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
    (state: RootState) => state.filteredProduct.likeFoods,
    (state: RootState) => state.filteredProduct.recentOrderFoods,
    (state: RootState) => state.filteredProduct.lastAppliedFilter,
    (state: RootState) => state.filteredProduct.lastFilteredList,
    // filter state
    (state: RootState) => state.filteredProduct.filter.baseListType,
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
    searchQuery,
    platformNm,
    recentlyOpened,
    liked,
    recentlyOrdered,
    random3,
    sortBy
  ) => {
    if (lastAppliedFilter === "sortBy" && lastFilteredList.length > 0) {
      // Sorting
      const result = [...lastFilteredList];
      if (sortBy === "priceAsc") {
        result.sort((a, b) => Number(a.price) - Number(b.price));
      } else if (sortBy === "priceDesc") {
        result.sort((a, b) => Number(b.price) - Number(a.price));
      }
      return result;
    }

    // Choose base list
    let result =
      baseListType === "availableFoods"
        ? [...availableFoods]
        : [...totalFoodList];

    // Filtering
    if (platformNm.length > 0) {
      result = result.filter((p) => platformNm.includes(p.platformNm));
    }
    if (recentlyOpened && Array.isArray(recentOpenedFoodsPNoArr)) {
      const ids = new Set(recentOpenedFoodsPNoArr);
      result = result.filter((p) => ids.has(p.productNo));
    }
    if (liked && Array.isArray(likeFoods)) {
      const ids = new Set(likeFoods.map((p) => p.productNo));
      result = result.filter((p) => ids.has(p.productNo));
    }
    if (recentlyOrdered && Array.isArray(recentOrderFoods)) {
      const ids = new Set(recentOrderFoods.map((p) => p.productNo));
      result = result.filter((p) => ids.has(p.productNo));
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
    if (sortBy === "priceAsc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return result;
  }
);

export const {
  setAvailableFoods,
  setBaseListType,
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
