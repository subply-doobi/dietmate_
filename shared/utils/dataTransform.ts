import {
  IDietDetailData,
  IDietDetailProductData,
  IDietTotalObjData,
} from '../api/types/diet';
import {IOrderData, IOrderedProduct} from '../api/types/order';
import {IProductData} from '../api/types/product';

interface IRegroupedData {
  [key: string]: IProductData[];
}
export const regroupDDataBySeller = (dDData: IDietDetailData | undefined) =>
  !dDData
    ? {}
    : dDData.reduce((acc: IRegroupedData, cur) => {
        const key = cur.platformNm;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(cur);
        return acc;
      }, {});

// 다른 끼니에 같은 productNo 식품 있어도 그냥 추가
// <- 식품사별 금액만 계산할 것이라서 이후 식품을 보여준다면 중복상품qty 조절 필요함
export const reGroupOrderBySeller = (
  orderData: IOrderData | undefined,
): IOrderedProduct[][] => {
  let reGroupedProducts: Array<IOrderedProduct[]> = [[]];
  if (orderData === undefined || orderData.length === 0)
    return reGroupedProducts;
  for (let i = 0; i < orderData.length; i++) {
    if (i === 0) {
      reGroupedProducts[0].push(orderData[i]);
      continue;
    }
    let isNewSeller = true;
    for (let j = 0; j < reGroupedProducts.length; j++) {
      if (reGroupedProducts[j][0]?.platformNm === orderData[i]?.platformNm) {
        reGroupedProducts[j].push(orderData[i]);
        isNewSeller = false;
        break;
      }
    }
    if (isNewSeller) {
      reGroupedProducts.push([orderData[i]]);
    }
  }
  return reGroupedProducts;
};

export const regroupByBuyDateAndDietNo = (
  orderData: IOrderData | undefined,
): IOrderedProduct[][][] => {
  if (!orderData) return [];

  const regrouped: IOrderedProduct[][][] = [];

  orderData.forEach(data => {
    const {buyDate, dietNo} = data;
    const buyDateIndex = regrouped.findIndex(
      group => group[0][0].buyDate === buyDate,
    );

    if (buyDateIndex === -1) {
      regrouped.push([[data]]);
    } else {
      const dietNoIndex = regrouped[buyDateIndex].findIndex(
        group => group[0].dietNo === dietNo,
      );

      if (dietNoIndex === -1) {
        regrouped[buyDateIndex].push([data]);
      } else {
        regrouped[buyDateIndex][dietNoIndex].push(data);
      }
    }
  });

  return regrouped;
};

interface IRegroupedBySellerFromDTOData {
  [dietNo: string]: {
    [platformNm: string]: IDietDetailData;
  };
}
export const reGroupBySellerFromDTOData = (
  dTOData: IDietTotalObjData | undefined,
): IRegroupedBySellerFromDTOData => {
  let regroupedBySeller: IRegroupedBySellerFromDTOData = {};
  if (!dTOData) return regroupedBySeller;

  const dietNoArr = Object.keys(dTOData);
  dietNoArr.forEach(dietNo => {
    dTOData[dietNo].dietDetail.forEach(p => {
      if (!regroupedBySeller[dietNo]) {
        regroupedBySeller[dietNo] = {[p.platformNm]: [p]};
      } else if (!regroupedBySeller[dietNo][p.platformNm]) {
        regroupedBySeller[dietNo][p.platformNm] = [p];
      } else {
        regroupedBySeller[dietNo][p.platformNm].push(p);
      }
    });
  });
  return regroupedBySeller;
};

export const tfDTOToDDA = (dTOData: IDietTotalObjData | undefined) => {
  if (!dTOData) return [];

  const productMap = new Map<string, IDietDetailProductData>();

  Object.values(dTOData).forEach(menu => {
    menu.dietDetail.forEach(p => {
      if (productMap.has(p.productNo)) {
        productMap.get(p.productNo)!.qty += p.qty;
      } else {
        productMap.set(p.productNo, {...p});
      }
    });
  });

  return Array.from(productMap.values());
};

////////////////////////////////////////////////////////////
// 끼니 자동구성 식품 그룹화 //
////////////////////////////////////////////////////////////

interface IFoodCategory {
  [key: string]: IProductData[];
  lunchBox: IProductData[];
  chicken: IProductData[];
  salad: IProductData[];
  snack: IProductData[];
  chip: IProductData[];
  drink: IProductData[];
}
export interface IFoodGroupForAutoMenu {
  [key: string]: IFoodCategory;
  total: IFoodCategory;
  normal: IFoodCategory;
  highCarb: IFoodCategory;
  highProtein: IFoodCategory;
  highFat: IFoodCategory;
}

export const separateFoods = (totalFoodList: IProductData[]) => {
  const normalFood: IProductData[] = [];
  const highCarbFood: IProductData[] = [];
  const highProtFood: IProductData[] = [];
  const highFatFood: IProductData[] = [];

  totalFoodList.forEach(food => {
    const carbRatio = ((Number(food.carb) * 4) / Number(food.calorie)) * 100;
    const proteinRatio =
      ((Number(food.protein) * 4) / Number(food.calorie)) * 100;
    const fatRatio = ((Number(food.fat) * 9) / Number(food.calorie)) * 100;

    if (carbRatio > 50) {
      highCarbFood.push(food);
    } else if (proteinRatio > 50) {
      highProtFood.push(food);
    } else if (fatRatio > 50) {
      highFatFood.push(food);
    } else {
      normalFood.push(food);
    }
  });

  return {
    highCarbFood,
    highProtFood,
    highFatFood,
    normalFood,
  };
};

export const categorizeFood = (
  foods: IProductData[],
  selectedCategoryIdxArr: number[] = [0, 1, 2, 3, 4, 5],
) => {
  // 001: 도시락   | 002: 닭가슴살 | 003: 샐러드
  // 004: 영양간식 | 005: 과자     | 006: 음료
  const categorizedFood: IFoodCategory = {
    lunchBox: [],
    chicken: [],
    salad: [],
    snack: [],
    chip: [],
    drink: [],
  };
  const isLunchBoxSelected = selectedCategoryIdxArr.includes(1);
  const isChickenSelected = selectedCategoryIdxArr.includes(2);
  const isSaladSelected = selectedCategoryIdxArr.includes(3);
  const isSnackSelected = selectedCategoryIdxArr.includes(4);
  const isChipSelected = selectedCategoryIdxArr.includes(5);
  const isDrinkSelected = selectedCategoryIdxArr.includes(6);

  foods.forEach(food => {
    const categoryCd = food.categoryCd;
    switch (categoryCd) {
      case 'CG001':
        isLunchBoxSelected && categorizedFood.lunchBox.push(food);
        break;
      case 'CG002':
        isChickenSelected && categorizedFood.chicken.push(food);
        break;
      case 'CG003':
        isSaladSelected && categorizedFood.salad.push(food);
        break;
      case 'CG004':
        isSnackSelected && categorizedFood.snack.push(food);
        break;
      case 'CG005':
        isChipSelected && categorizedFood.chip.push(food);
        break;
      case 'CG006':
        isDrinkSelected && categorizedFood.drink.push(food);
        break;
      default:
        break;
    }
  });

  return categorizedFood;
};
