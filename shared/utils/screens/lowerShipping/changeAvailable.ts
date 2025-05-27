import { ILowerShippingMenuObj } from "@/shared/utils/sumUp";
import { IProductData } from "@/shared/api/types/product";
import { NUTR_ERROR_RANGE } from "@/shared/constants";

// Utility function to check if a food is "available" (nutrient similarity)
function isAvailableFood(
  food: IProductData,
  productToDel: IProductData,
  targetPlatformNm?: string
) {
  const sPCalorie = parseInt(productToDel.calorie);
  const sPCarb = parseInt(productToDel.carb);
  const sPProtein = parseInt(productToDel.protein);
  const sPFat = parseInt(productToDel.fat);

  const errMinCalorie = sPCalorie + NUTR_ERROR_RANGE.calorie[0];
  const errMaxCalorie = sPCalorie + NUTR_ERROR_RANGE.calorie[1];
  const errMinCarb = sPCarb + NUTR_ERROR_RANGE.carb[0];
  const errMaxCarb = sPCarb + NUTR_ERROR_RANGE.carb[1];
  const errMinProtein = sPProtein + NUTR_ERROR_RANGE.protein[0];
  const errMaxProtein = sPProtein + NUTR_ERROR_RANGE.protein[1];
  const errMinFat = sPFat + NUTR_ERROR_RANGE.fat[0];
  const errMaxFat = sPFat + NUTR_ERROR_RANGE.fat[1];

  const calorie = parseInt(food.calorie);
  const carb = parseInt(food.carb);
  const protein = parseInt(food.protein);
  const fat = parseInt(food.fat);

  return (
    food.platformNm === targetPlatformNm &&
    food.productNo !== productToDel.productNo &&
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
  menuArr: ILowerShippingMenuObj[],
  totalFoodList: IProductData[],
  targetPlatformNm?: string
) {
  return menuArr.map((menu) => {
    // For each product in dietDetailData, find available substitutes
    const changeAvailableFoods: Record<string, IProductData[]> = {};
    menu.dietDetailData.forEach((product) => {
      changeAvailableFoods[product.productNo] = totalFoodList.filter((food) =>
        isAvailableFood(food, product, targetPlatformNm)
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
