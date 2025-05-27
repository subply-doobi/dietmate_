import { IDietTotalObjData } from "../api/types/diet";
import { IOrderData, IOrderedProduct } from "../api/types/order";
import { IProductData } from "../api/types/product";
import { IShippingPriceObj } from "./sumUp";

// multiple recommended menu -> flatten foodlist without duplicates
export const flattenMenuArr = (menu: IProductData[][]) => {
  const foodList: IProductData[] = [];
  const foodSet = new Set<string>();
  menu.forEach((foodGroup) => {
    foodGroup.forEach((food) => {
      if (!foodSet.has(food.productNo)) {
        foodSet.add(food.productNo);
        foodList.push(food);
      }
    });
  });
  return foodList;
};

export const filterDuplicateProduct = ({
  numOfProduct,
  products,
}: {
  products?: IProductData[] | IOrderedProduct[];
  numOfProduct?: number;
}) => {
  if (!products) return [];
  const productSet = new Set<string>();
  const filteredProducts = products.filter((product) => {
    if (productSet.has(product.productNo)) {
      return false;
    } else {
      productSet.add(product.productNo);
      return true;
    }
  });
  if (!numOfProduct)
    return filteredProducts as IProductData[] | IOrderedProduct[];
  return filteredProducts.slice(0, numOfProduct) as
    | IProductData[]
    | IOrderedProduct[];
};

export const filterByPlatformNm = ({
  products,
  platformNm,
}: {
  products: IProductData[];
  platformNm: string;
}) => {
  return products.filter((product) => product.platformNm === platformNm);
};

export const convertProductDataArrToPNoArr = (
  products?: IProductData[] | IOrderedProduct[]
) => {
  if (!products) return [];
  return products.map((product) => product.productNo);
};

export const filterByProductNoArr = ({
  products,
  productNoArr,
}: {
  products: IProductData[];
  productNoArr: string[];
}) => {
  return products.filter((product) => productNoArr.includes(product.productNo));
};

export const filterByNutrient = ({
  totalFoodList,
  calorie,
  carb,
  protein,
  fat,
}: {
  totalFoodList: IProductData[];
  calorie: number[];
  carb: number[];
  protein: number[];
  fat: number[];
}) => {
  return totalFoodList.filter((food) => {
    const fCalorie = Number(food.calorie);
    const fCarb = Number(food.carb);
    const fProtein = Number(food.protein);
    const fFat = Number(food.fat);

    if (
      fCalorie >= calorie[0] &&
      fCalorie <= calorie[1] &&
      fCarb >= carb[0] &&
      fCarb <= carb[1] &&
      fProtein >= protein[0] &&
      fProtein <= protein[1] &&
      fFat >= fat[0] &&
      fFat <= fat[1]
    ) {
      return true;
    }
  });
};
