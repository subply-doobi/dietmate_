import { IDietTotalObjData } from "../api/types/diet";
import { IOrderData, IOrderedProduct } from "../api/types/order";
import { IProductData } from "../api/types/product";

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

interface IShippingPriceObj {
  [key: string]: {
    price: number;
    freeShippingPrice: number;
    shippingPrice: number;
    shippingText: string;
  };
}
export const findClosestFSPlatformNm = (
  shippingPriceObj: IShippingPriceObj
) => {
  const platformNmArr = Object.keys(shippingPriceObj);
  if (platformNmArr.length === 0) return undefined;
  // make array of objects with platformNm and remainPrice(freeShippingPrice - price)
  const remainPriceArr = platformNmArr.map((platformNm) => ({
    platformNm,
    remainPrice:
      shippingPriceObj[platformNm].freeShippingPrice -
      shippingPriceObj[platformNm].price,
  }));
  // sort by remainPrice
  remainPriceArr.sort((a, b) => a.remainPrice - b.remainPrice);
  // return item with the smallest positive remainPrice
  const closestPlatform = remainPriceArr.find((item) => item.remainPrice >= 0);
  return closestPlatform || undefined;
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
