import { ILowerShippingMenuObj, sumUpNutrients } from "@/shared/utils/sumUp";
import { IProductData } from "@/shared/api/types/product";
import { NUTR_ERROR_RANGE } from "@/shared/constants";
import { IBaseLineData } from "@/shared/api/types/baseLine";

// Utility function to check if a food is "available" (nutrient similarity)
function isAvailableFood(
  nutrBoundaryForFilter: {
    calorie: number[];
    carb: number[];
    protein: number[];
    fat: number[];
  },
  food: IProductData,
  productNoToDel: string,
  targetPlatformNm?: string
) {
  const {
    calorie: fCal,
    carb: fCarb,
    protein: fProtein,
    fat: fFat,
    productNo,
    platformNm,
  } = food;

  const calorie = parseInt(fCal);
  const carb = parseInt(fCarb);
  const protein = parseInt(fProtein);
  const fat = parseInt(fFat);
  const [errMinCalorie, errMaxCalorie] = nutrBoundaryForFilter.calorie;
  const [errMinCarb, errMaxCarb] = nutrBoundaryForFilter.carb;
  const [errMinProtein, errMaxProtein] = nutrBoundaryForFilter.protein;
  const [errMinFat, errMaxFat] = nutrBoundaryForFilter.fat;

  return (
    platformNm === targetPlatformNm &&
    productNo !== productNoToDel &&
    calorie >= errMinCalorie &&
    calorie <= errMaxCalorie &&
    carb >= errMinCarb &&
    carb <= errMaxCarb &&
    protein >= errMinProtein &&
    protein <= errMaxProtein &&
    fat >= errMinFat &&
    fat <= errMaxFat
  );
}

export type MenuWithChangeAvailableFoods = ILowerShippingMenuObj & {
  changeAvailableFoods: {
    [productNo: string]: IProductData[]; // key: productNo in dietDetailData, value: array of substitute foods
  };
};
// Main function
export function getMenusWithChangeAvailableFoods(
  bLData: IBaseLineData | undefined,
  menuArr: ILowerShippingMenuObj[],
  totalFoodList: IProductData[],
  targetPlatformNm?: string
) {
  if (!bLData) {
    return menuArr.map((menu) => ({
      ...menu,
      changeAvailableFoods: {},
    }));
  }
  return menuArr.map((menu) => {
    // For each product in dietDetailData, find available substitutes
    const changeAvailableFoods: Record<string, IProductData[]> = {};
    // target nutrients
    const { calorie: tCal, carb: tCarb, protein: tProtein, fat: tFat } = bLData;
    const bLNutr = {
      calorie: parseInt(tCal),
      carb: parseInt(tCarb),
      protein: parseInt(tProtein),
      fat: parseInt(tFat),
    };
    const { cal, carb, protein, fat } = sumUpNutrients(menu.dietDetailData);

    menu.dietDetailData.forEach((productToDel) => {
      const {
        calorie: pCal,
        carb: pCarb,
        protein: pProtein,
        fat: pFat,
        productNo,
      } = productToDel;

      const pNutr = {
        calorie: parseInt(pCal),
        carb: parseInt(pCarb),
        protein: parseInt(pProtein),
        fat: parseInt(pFat),
      };

      const excludedNutr = {
        calorie: cal - pNutr.calorie,
        carb: carb - pNutr.carb,
        protein: protein - pNutr.protein,
        fat: fat - pNutr.fat,
      };

      const nutrBoundaryForFilter = {
        calorie: [
          bLNutr.calorie + NUTR_ERROR_RANGE.calorie[0] - excludedNutr.calorie,
          bLNutr.calorie + NUTR_ERROR_RANGE.calorie[1] - excludedNutr.calorie,
        ],
        carb: [
          bLNutr.carb + NUTR_ERROR_RANGE.carb[0] - excludedNutr.carb,
          bLNutr.carb + NUTR_ERROR_RANGE.carb[1] - excludedNutr.carb,
        ],
        protein: [
          bLNutr.protein + NUTR_ERROR_RANGE.protein[0] - excludedNutr.protein,
          bLNutr.protein + NUTR_ERROR_RANGE.protein[1] - excludedNutr.protein,
        ],
        fat: [
          bLNutr.fat + NUTR_ERROR_RANGE.fat[0] - excludedNutr.fat,
          bLNutr.fat + NUTR_ERROR_RANGE.fat[1] - excludedNutr.fat,
        ],
      };

      changeAvailableFoods[productToDel.productNo] = totalFoodList.filter(
        (food) =>
          isAvailableFood(
            nutrBoundaryForFilter,
            food,
            productNo,
            targetPlatformNm
          )
      );
    });
    return {
      ...menu,
      changeAvailableFoods, // { [productNo]: IProductData[] }
    };
  });
}

export const checkNoFoodAvailable = (
  menu: MenuWithChangeAvailableFoods
): boolean => {
  return Object.keys(menu.changeAvailableFoods).every(
    (key) => menu.changeAvailableFoods[key].length === 0
  );
};
