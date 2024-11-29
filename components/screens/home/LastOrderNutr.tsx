import styled from "styled-components/native";
import { IOrderedProduct } from "@/shared/api/types/order";
import { sumUpNutrients } from "@/shared/utils/sumUp";
import { Col, TextMain, VerticalLine } from "@/shared/ui/styledComps";
import { FlatList } from "react-native";
import { SCREENWIDTH } from "@/shared/constants";

interface ILastOrderNutr {
  lastOrder: IOrderedProduct[][];
}
const LastOrderNutr = ({ lastOrder }: ILastOrderNutr) => {
  // 마지막 주문할 때 baseline이 없어서 주문 첫번째 끼니의 영양합계로 대체
  const { cal, carb, protein, fat } = sumUpNutrients(lastOrder[0]);

  const items = [
    {
      nutrient: "칼로리",
      value: Math.round(cal),
      unit: "kcal",
    },
    {
      nutrient: "탄수화물",
      unit: "g",
      value: Math.round(carb),
    },
    {
      nutrient: "단백질",
      unit: "g",
      value: Math.round(protein),
    },
    {
      nutrient: "지방",
      unit: "g",
      value: Math.round(fat),
    },
  ];

  return (
    <Box>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <Col
            style={{
              alignItems: "center",
              width: (SCREENWIDTH - 32 - 32 - 3) / 4,
            }}
          >
            <NutrientLabel>{item.nutrient}</NutrientLabel>
            <NutrientValue>
              {item.value} {item.unit}
            </NutrientValue>
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

export default LastOrderNutr;

const Box = styled.View`
  flex: 1;
  height: 40px;
`;

const NutrientValue = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  margin-top: 2px;
`;
const NutrientLabel = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
`;
