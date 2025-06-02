import { NUTR_ERROR_RANGE, SERVICE_PRICE_PER_PRODUCT } from "../constants";
import { IBaseLineData } from "../api/types/baseLine";
import {
  IDietDetailAllData,
  IDietDetailData,
  IDietTotalObjData,
} from "../api/types/diet";
import { IProductData } from "../api/types/product";
import { IOrderData, IOrderedProduct } from "../api/types/order";

export const sumUpNutrients = (
  dietDetail: IDietDetailData | IOrderData | undefined
) => {
  let cal = 0;
  let carb = 0;
  let protein = 0;
  let fat = 0;
  if (!dietDetail) {
    return { cal, carb, protein, fat };
  }
  for (let i = 0; i < dietDetail.length; i++) {
    cal += parseInt(dietDetail[i].calorie);
    carb += parseInt(dietDetail[i].carb);
    protein += parseInt(dietDetail[i].protein);
    fat += parseInt(dietDetail[i].fat);
  }
  return { cal, carb, protein, fat };
};

/** 현재 영양과 목표영양을 비교한 상태
 * error | empty | notEnough | satisfied | exceed
 */
export const getNutrStatus = ({
  totalFoodList,
  bLData,
  dDData,
}: {
  totalFoodList: IProductData[];
  bLData: IBaseLineData | undefined;
  dDData: IDietDetailData | undefined;
}): "error" | "empty" | "notEnough" | "satisfied" | "exceed" => {
  // error
  if (!bLData || !dDData || totalFoodList.length === 0) return "error";
  // empty
  if (dDData.length === 0) return "empty";

  const { calorie: calT, carb: carbT, protein: proteinT, fat: fatT } = bLData;
  const { cal, carb, protein, fat } = sumUpNutrients(dDData);
  const current = [cal, carb, protein, fat];
  const target = [Number(calT), Number(carbT), Number(proteinT), Number(fatT)];
  const remain = [
    Number(calT) - cal,
    Number(carbT) - carb,
    Number(proteinT) - protein,
    Number(fatT) - fat,
  ];

  let exceedNumber = 0;
  const indexToNutr = ["calorie", "carb", "protein", "fat"];
  for (let i = 0; i < current.length; i++) {
    if (NUTR_ERROR_RANGE[indexToNutr[i]][0] > remain[i]) exceedNumber += 1;
  }
  if (exceedNumber !== 0) return "exceed";

  // satisfied
  if (
    parseInt(calT) + NUTR_ERROR_RANGE.calorie[0] <= cal &&
    parseInt(calT) + NUTR_ERROR_RANGE.calorie[1] >= cal &&
    // parseInt(carbT) + NUTR_ERROR_RANGE.carb[0] <= carb &&
    parseInt(carbT) + NUTR_ERROR_RANGE.carb[1] >= carb &&
    // parseInt(proteinT) + NUTR_ERROR_RANGE.protein[0] <=
    //   protein &&
    parseInt(proteinT) + NUTR_ERROR_RANGE.protein[1] >= protein &&
    // parseInt(fatT) + NUTR_ERROR_RANGE.fat[0] <= fat &&
    parseInt(fatT) + NUTR_ERROR_RANGE.fat[1] >= fat
  )
    return "satisfied";

  for (let i = 0; i < totalFoodList.length; i++) {
    if (
      Number(totalFoodList[i].calorie) <=
        remain[0] + NUTR_ERROR_RANGE[indexToNutr[0]][1] &&
      Number(totalFoodList[i].carb) <=
        remain[1] + NUTR_ERROR_RANGE[indexToNutr[1]][1] &&
      Number(totalFoodList[i].protein) <=
        remain[2] + NUTR_ERROR_RANGE[indexToNutr[2]][1] &&
      Number(totalFoodList[i].fat) <=
        remain[3] + NUTR_ERROR_RANGE[indexToNutr[3]][1]
    ) {
      return "notEnough";
    }
  }
  return "exceed";
};

export const checkEveryMenuEmpty = (dTOData: IDietTotalObjData) => {
  const dietNoArr = Object.keys(dTOData);
  const menuLengthList = dietNoArr.map(
    (dietNo) => dTOData[dietNo].dietDetail.length
  );
  if (menuLengthList.every((m: number) => m === 0)) {
    return true;
  }
  return false;
};

export const sumUpPriceOfSeller = (
  dietDetailAllData: IDietDetailAllData | undefined,
  seller: string
) => {
  if (!dietDetailAllData) return 0;
  // get sum of price by seller with reduce function
  return dietDetailAllData.reduce((acc, cur) => {
    return cur.platformNm === seller
      ? (parseInt(cur.price) + SERVICE_PRICE_PER_PRODUCT) * parseInt(cur.qty) +
          acc
      : acc;
  }, 0);
};

export const commaToNum = (num: number | string | undefined) => {
  if (!num) return "0";
  const n = typeof num === "number" ? num.toString() : num;
  return n.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

interface IRegroupedBySeller {
  [key: string]: IDietDetailData;
}

export interface IShippingPriceValues {
  platformNm: string;
  price: number;
  freeShippingPrice: number;
  sellerShippingPrice: number;
  remainPrice: number;
  shippingPrice: number;
  shippingText: string;
}
export interface IShippingPriceObj {
  [key: string]: IShippingPriceValues;
}
const getShippingPriceObjBySeller = (reGroupedBySeller: IRegroupedBySeller) => {
  const sellerArr = Object.keys(reGroupedBySeller);
  let shippingPriceObj: IShippingPriceObj = {};
  for (let seller of sellerArr) {
    if (!shippingPriceObj[seller]) {
      shippingPriceObj[seller] = {
        platformNm: seller,
        price: 0,
        freeShippingPrice: 0,
        sellerShippingPrice: 0,
        shippingPrice: 0,
        remainPrice: 0,
        shippingText: "",
      };
    }

    if (reGroupedBySeller[seller].length === 0) continue;

    shippingPriceObj[seller].price = sumUpPrice(
      reGroupedBySeller[seller],
      true
    );

    shippingPriceObj[seller].freeShippingPrice = parseInt(
      reGroupedBySeller[seller][0].freeShippingPrice,
      10
    );

    shippingPriceObj[seller].sellerShippingPrice = parseInt(
      reGroupedBySeller[seller][0].shippingPrice,
      10
    );

    shippingPriceObj[seller].remainPrice =
      shippingPriceObj[seller].freeShippingPrice -
      shippingPriceObj[seller].price;

    const isFree =
      shippingPriceObj[seller].remainPrice <= 0 ||
      shippingPriceObj[seller].freeShippingPrice === 0;

    shippingPriceObj[seller].shippingPrice = isFree
      ? 0
      : parseInt(reGroupedBySeller[seller][0].shippingPrice, 10);

    shippingPriceObj[seller].shippingText = isFree
      ? "무료"
      : `${commaToNum(shippingPriceObj[seller].shippingPrice)} (${commaToNum(
          shippingPriceObj[seller].remainPrice
        )}원 더 구매 시 무료)`;
  }

  return shippingPriceObj;
};

export const getSortedShippingPriceObj = (
  shippingPriceObj: IShippingPriceObj
) => {
  const platformNmArr = Object.keys(shippingPriceObj);
  if (platformNmArr.length === 0)
    return {
      free: [],
      notFree: [],
    };

  // make array of objects with shippingPriceObj
  const shippingPriceObjArr = platformNmArr.map((platformNm) => {
    return shippingPriceObj[platformNm];
  });

  // sort by remainPrice
  shippingPriceObjArr.sort((a, b) => {
    return a.remainPrice - b.remainPrice;
  });

  // separate positive and negative remainPrice
  const free = shippingPriceObjArr.filter((item) => item.remainPrice <= 0);
  const notFree = shippingPriceObjArr.filter((item) => item.remainPrice > 0);

  return {
    free,
    notFree,
  };
};

export interface ILowerShippingMenuObj {
  index: number;
  dietDetailData: IDietDetailData;
  currentDietPrice: number;
  currentDietSellerPrice: number;
}
export const getSortedMenuArrBySellerPrice = ({
  dTOData,
  seller,
}: {
  dTOData: IDietTotalObjData;
  seller: string;
}) => {
  const dietNoArr = Object.keys(dTOData);
  const included: ILowerShippingMenuObj[] = [];
  const notIncluded: ILowerShippingMenuObj[] = [];

  dietNoArr.forEach((dietNo, idx) => {
    const SellerDDData = dTOData[dietNo].dietDetail.filter(
      (food) => food.platformNm === seller
    );
    const currentDietSellerPrice = sumUpPrice(SellerDDData, true);
    const menuObj = {
      index: idx,
      dietDetailData: dTOData[dietNo].dietDetail,
      currentDietPrice: sumUpPrice(dTOData[dietNo].dietDetail, false),
      currentDietSellerPrice,
    };
    if (SellerDDData.length > 0) {
      included.push(menuObj);
    } else {
      notIncluded.push(menuObj);
    }
  });

  included.sort((a, b) => b.currentDietSellerPrice - a.currentDietSellerPrice);
  notIncluded.sort(
    (a, b) => b.currentDietSellerPrice - a.currentDietSellerPrice
  );

  return { included, notIncluded };
};

/** true | false 는 수량 고려할 것인지 */
export const sumUpPrice = (
  dietDetail: IDietDetailData | IOrderedProduct[] | undefined,
  qtyConsidered?: boolean | undefined
) => {
  if (!dietDetail || dietDetail.length === 0) {
    return 0;
  }
  let price = 0;
  for (let i = 0; i < dietDetail.length; i++) {
    let qty = qtyConsidered ? parseInt(dietDetail[i].qty) : 1;
    price += (parseInt(dietDetail[i].price) + SERVICE_PRICE_PER_PRODUCT) * qty;
  }
  return price;
};

export const sumUpDietFromDTOData = (
  dTOData: IDietTotalObjData | undefined
) => {
  let menuNum = 0;
  let productNum = 0;
  let priceTotal = 0;
  let totalShippingPrice = 0;
  let regroupedBySeller: IRegroupedBySeller = {};
  let shippingPriceObj: IShippingPriceObj = {};
  if (!dTOData || Object.keys(dTOData).length === 0)
    return {
      menuNum,
      productNum,
      priceTotal,
      totalShippingPrice,
      regroupedBySeller,
      shippingPriceObj,
    };

  const dietNoArr = Object.keys(dTOData);
  for (let dietNo of dietNoArr) {
    if (dTOData[dietNo].dietDetail.length === 0) continue;
    menuNum += dTOData[dietNo].dietDetail[0]
      ? 1 * parseInt(dTOData[dietNo].dietDetail[0].qty)
      : 1;
    const sum = sumUpPrice(dTOData[dietNo].dietDetail, true);
    priceTotal += sum;
    for (let p of dTOData[dietNo].dietDetail) {
      productNum += parseInt(p.qty);
      if (!regroupedBySeller[p.platformNm]) {
        regroupedBySeller[p.platformNm] = [{ ...p }];
        continue;
      }
      const isExist = regroupedBySeller[p.platformNm].some(
        (sp) => sp.productNo === p.productNo
      );
      if (!isExist) {
        regroupedBySeller[p.platformNm].push({ ...p });
      } else {
        let productToMod = regroupedBySeller[p.platformNm].find(
          (sp) => sp.productNo === p.productNo
        );
        if (productToMod)
          productToMod.qty = String(
            parseInt(productToMod.qty) + parseInt(p.qty)
          );
      }
    }
  }

  shippingPriceObj = getShippingPriceObjBySeller(regroupedBySeller);
  const keys = Object.keys(shippingPriceObj);
  totalShippingPrice = keys.reduce(
    (acc, cur) => acc + shippingPriceObj[cur].shippingPrice,
    0
  );

  return {
    menuNum,
    productNum,
    priceTotal,
    regroupedBySeller,
    shippingPriceObj,
    totalShippingPrice,
  };
};

export const getMedianCalorie = (totalFoodList: IProductData[]) => {
  // copy totalFoodList
  const foodList = [...totalFoodList];
  const sortedFoodList = foodList.sort(
    (a, b) => Number(a.calorie) - Number(b.calorie)
  );
  const medianIndex = Math.floor(sortedFoodList.length / 2);
  return Number(sortedFoodList[medianIndex].calorie);
};
