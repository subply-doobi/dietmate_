import styled from "styled-components/native";
import { Col, TextMain, VerticalLine } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { IBaseLineData } from "@/shared/api/types/baseLine";
import { FlatList } from "react-native";
import { SCREENWIDTH } from "@/shared/constants";

type IAlertType =
  | "calorieChange"
  | "carbChange"
  | "proteinChange"
  | "fatChange";

interface INutrTarget {
  baseLineData: IBaseLineData;
}
const NutrTarget = ({ baseLineData }: INutrTarget) => {
  const nutrTargetData: Array<{
    nutrient: string;
    value: number;
    unit: string;
    color: string;
    alertType: IAlertType;
  }> = [
    {
      nutrient: "칼로리",
      value: parseFloat(baseLineData?.calorie || "0"),
      unit: "kcal",
      color: colors.calorie,
      alertType: "calorieChange",
    },
    {
      nutrient: "탄수화물",
      unit: "g",
      value: parseFloat(baseLineData?.carb || "0"),
      color: colors.carb,
      alertType: "carbChange",
    },
    {
      nutrient: "단백질",
      unit: "g",
      value: parseFloat(baseLineData?.protein || "0"),
      color: colors.protein,
      alertType: "proteinChange",
    },
    {
      nutrient: "지방",
      unit: "g",
      value: parseFloat(baseLineData?.fat || "0"),
      color: colors.fat,
      alertType: "fatChange",
    },
  ];

  return (
    <Box>
      <FlatList
        data={nutrTargetData}
        renderItem={({ item }) => (
          <Col style={{ alignItems: "center", width: (SCREENWIDTH - 3) / 4 }}>
            <NutrValue>
              {item.value} {item.unit}
            </NutrValue>
            <NutrBar style={{ backgroundColor: item.color }} />
            <NutrLabel>{item.nutrient}</NutrLabel>
          </Col>
        )}
        ItemSeparatorComponent={() => <VerticalLine />}
        keyExtractor={(item) => item.nutrient}
        horizontal={true}
        scrollEnabled={false}
      />
    </Box>
  );
};

export default NutrTarget;

const Box = styled.View`
  flex-direction: row;
  flex: 1;
  height: 50px;
  align-items: center;
  justify-content: space-between;
`;

const NutrValue = styled(TextMain)`
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
`;

const NutrBar = styled.View`
  width: 54px;
  height: 4px;
  border-radius: 2px;
  margin-top: 4px;
`;

const NutrLabel = styled(TextMain)`
  font-size: 12px;
  line-height: 18px;
  margin-top: 4px;
`;
