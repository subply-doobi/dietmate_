import { IBaseLineData } from "@/shared/api/types/baseLine";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";

export interface ITableItem {
  name: string;
  column1: string;
  column2: string;
  rate?: string;
  color?: string;
}
// 영양소제한
// 나트륨 => 2300mg
// 당류 => 20% (1일 영양소 기준치)
// 트랜스지방 => 0.01% (1일 에너지 기준치)
// 포화지방 => 7% (1일 에너지 기준치)
// 콜레스테롤 => 300mg

export const makeTableData = (
  food: IProductData | undefined,
  baseLineData: IBaseLineData | undefined
) => {
  if (!food) return [];
  const table: ITableItem[] = [
    {
      name: "calorie",
      column1: "칼로리",
      column2: `${food.calorie ? Math.ceil(Number(food.calorie)) : ""} kcal`,
      rate: baseLineData
        ? `${Math.ceil(
            (Number(food.calorie) / (Number(baseLineData.calorie) * 3)) * 100
          )}%`
        : "",
      color: colors.calorie,
    },
    {
      name: "sodium",
      column1: "나트륨",
      column2: `${food.sodium ? Math.ceil(Number(food.sodium)) : ""} mg`,
      rate: baseLineData
        ? `${Math.ceil((Number(food.sodium) / 2300) * 100)}%`
        : "",
    },
    {
      name: "carb",
      column1: "탄수화물",
      column2: `${food.carb ? Math.ceil(Number(food.carb)) : ""} g`,
      rate: baseLineData
        ? `${Math.ceil(
            (Number(food.carb) / (Number(baseLineData.carb) * 3)) * 100
          )}%`
        : "",
      color: colors.carb,
    },
    {
      name: "sugar",
      column1: "  당류",
      column2: `${food.sugar ? Math.ceil(Number(food.sugar)) : ""} g`,
      rate: baseLineData
        ? `${Math.ceil(
            (Number(food.sugar) /
              ((Number(baseLineData.calorie) / 4) * 3 * 0.2)) *
              100
          )}%`
        : "",
    },
    {
      name: "protein",
      column1: "단백질",
      column2: `${food.protein ? Math.ceil(Number(food.protein)) : ""} g`,
      rate: baseLineData
        ? `${Math.ceil(
            (Number(food.protein) / (Number(baseLineData.protein) * 3)) * 100
          )}%`
        : "",
      color: colors.protein,
    },
    {
      name: "fat",
      column1: "지방",
      column2: `${food.fat ? Math.ceil(Number(food.fat)) : ""} g`,
      rate: baseLineData
        ? `${Math.ceil(
            (Number(food.fat) / (Number(baseLineData.fat) * 3)) * 100
          )}%`
        : "",
      color: colors.fat,
    },

    {
      name: "transFat",
      column1: "  트랜스지방",
      column2: `${food.transFat ? Math.ceil(Number(food.transFat)) : ""} g`,
      rate: baseLineData
        ? `${Math.ceil(
            (Number(food.transFat) /
              ((Number(baseLineData.calorie) / 9) * 0.01 * 3)) *
              100
          )}%`
        : "",
    },
    {
      name: "saturatedFat",
      column1: "  포화지방",
      column2: `${
        food.saturatedFat ? Math.ceil(Number(food.saturatedFat)) : ""
      } g`,
      rate: baseLineData
        ? `${Math.ceil(
            (Number(food.saturatedFat) /
              (((Number(baseLineData.calorie) * 0.07) / 9) * 3)) *
              100
          )}%`
        : "",
    },
    {
      name: "cholesterol",
      column1: "콜레스테롤",
      column2: `${
        food.cholesterol ? Math.ceil(Number(food.cholesterol)) : ""
      } mg`,
      rate: baseLineData
        ? `${Math.ceil((Number(food.cholesterol) / 300) * 100)}%`
        : "",
    },
    // {
    //   name: 'itemReportNo',
    //   column1: '품목보고번호',
    //   // itemReportNo 데이터 없으면 '-' 표시
    //   column2: `${food.manufacturerBizNo ? food.manufacturerBizNo : '-'}`,
    // },
    // {
    //   name: 'manufacturerNm',
    //   column1: '제조사',
    //   column2: `${food.manufacturerNm ? food.manufacturerNm : '-'}`,
    // },
  ];
  return table;
};
