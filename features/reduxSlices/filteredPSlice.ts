import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IProductData } from "@/shared/api/types/product";
import {
  filterByPlatformNm,
  filterByProductNoArr,
  convertProductDataArrToPNoArr,
  filterDuplicateProduct,
} from "@/shared/utils/filter";
import { IOrderedProduct } from "@/shared/api/types/order";
import { getSortedShippingPriceObj } from "@/shared/utils/sumUp";

interface AutoAddState {
  availableFoods: IProductData[];
  randomFoods: IProductData[];
  lowShippingFoods: IProductData[];
  recentFoods: IProductData[];
  recentOrderFoods: IProductData[];
  likeFoods: IProductData[];
  others: IProductData[];
  excessFoods: IProductData[];
}

const initialState: AutoAddState = {
  availableFoods: [],
  randomFoods: [],
  lowShippingFoods: [],
  recentOrderFoods: [],
  recentFoods: [],
  likeFoods: [],
  others: [],
  excessFoods: [],
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
        shippingPriceObj: any;
        recentProductNoArr: string[];
        listOrderData?: IOrderedProduct[];
        likeData?: IProductData[];
      }>
    ) => {
      const {
        totalFoodList,
        availableFoods,
        shippingPriceObj,
        listOrderData = [],
        likeData = [],
      } = action.payload;
      state.availableFoods = availableFoods;

      // Random foods
      const randomFoods = [...availableFoods]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      state.randomFoods = randomFoods;

      // Low shipping foods
      const lowerShippingPricePlatform =
        getSortedShippingPriceObj(shippingPriceObj)?.notFree[0];
      const lowShippingFoods = lowerShippingPricePlatform
        ? filterByPlatformNm({
            products: availableFoods,
            platformNm: lowerShippingPricePlatform.platformNm,
          })
        : [];
      state.lowShippingFoods = lowShippingFoods;

      // Recent order foods
      const recentOrderTotal = filterDuplicateProduct({
        numOfProduct: 10,
        products: listOrderData,
      });
      const orderedPNoArr = convertProductDataArrToPNoArr(recentOrderTotal);
      const recentOrderFoods = filterByProductNoArr({
        products: availableFoods,
        productNoArr: orderedPNoArr,
      });
      state.recentOrderFoods = recentOrderFoods;

      // recently opened foods
      const recentFoods = filterByProductNoArr({
        products: availableFoods,
        productNoArr: action.payload.recentProductNoArr,
      });
      state.recentFoods = recentFoods;

      // Like foods
      const likeFoodsPNoArr = convertProductDataArrToPNoArr(likeData);
      const likeFoods = filterByProductNoArr({
        products: availableFoods,
        productNoArr: likeFoodsPNoArr,
      });
      state.likeFoods = likeFoods;

      // foods are not included in any other categories
      const allFilteredFoods = [
        ...randomFoods,
        ...lowShippingFoods,
        ...recentOrderFoods,
        ...recentFoods,
        ...likeFoods,
      ];
      const allFilteredPNoArr = convertProductDataArrToPNoArr(allFilteredFoods);
      const others = filterDuplicateProduct({
        numOfProduct: 10,
        products: availableFoods.filter((food) => {
          const isFiltered = allFilteredPNoArr.includes(food.productNo);
          return !isFiltered;
        }),
      }) as IProductData[];
      state.others = others;

      // foods that are excess nutrient target (not available foods)
      const othersPNoArr = convertProductDataArrToPNoArr(others);
      const totalAvailableFoodsPNoArr = [...allFilteredPNoArr, ...othersPNoArr];
      const excessFoods = totalFoodList.filter((food) => {
        const isFiltered = totalAvailableFoodsPNoArr.includes(food.productNo);
        return !isFiltered;
      });
      state.excessFoods = filterDuplicateProduct({
        numOfProduct: 10,
        products: excessFoods,
      }) as IProductData[];
    },
    resetRandomFoods: (state) => {
      state.randomFoods = [...state.availableFoods]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    },
  },
});

export const { setAvailableFoods, resetRandomFoods } = filteredPSlice.actions;
export default filteredPSlice.reducer;
