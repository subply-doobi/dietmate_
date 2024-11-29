import styled from "styled-components/native";
import { Col, Row, TextMain, VerticalLine } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { SCREENWIDTH } from "@/shared/constants";

interface INutr {
  calorie: string;
  carb: string;
  protein: string;
  fat: string;
}
const Nutr = ({ calorie, carb, protein, fat }: INutr) => {
  const nutrData: Array<{
    nutrient: string;
    value: number;
    unit: string;
    color: string;
  }> = [
    {
      nutrient: "칼로리",
      value: parseFloat(calorie || "0"),
      unit: "kcal",
      color: colors.calorie,
    },
    {
      nutrient: "탄수화물",
      unit: "g",
      value: parseFloat(carb || "0"),
      color: colors.carb,
    },
    {
      nutrient: "단백질",
      unit: "g",
      value: parseFloat(protein || "0"),
      color: colors.protein,
    },
    {
      nutrient: "지방",
      unit: "g",
      value: parseFloat(fat || "0"),
      color: colors.fat,
    },
  ];

  return (
    <Box>
      {nutrData.map((item, idx) => (
        <Row key={item.nutrient}>
          <Col
            style={{ alignItems: "center", width: (SCREENWIDTH - 32 - 3) / 4 }}
          >
            <NutrValue style={{}}>
              {item.value.toFixed(0)} {item.unit}
            </NutrValue>
            <NutrBar
              style={{
                backgroundColor: item.color,
              }}
            />
            <NutrLabel>{item.nutrient}</NutrLabel>
          </Col>
          {idx !== nutrData.length - 1 && <VerticalLine />}
        </Row>
      ))}
    </Box>
  );
};

export default Nutr;

const Box = styled.View`
  width: 100%;
  flex-direction: row;
  height: 50px;
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
