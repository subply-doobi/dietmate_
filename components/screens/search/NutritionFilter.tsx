import { TouchableWithoutFeedback } from "react-native";
import styled from "styled-components/native";
import { FILTER_BTN_RANGE } from "@/shared/constants";
import RangeBtn from "./RangeBtn";

const NutritionFilter = () => {
  return (
    <TouchableWithoutFeedback>
      <Container>
        {/* 각 영양성분 별 범위 0~3: 칼탄단지 | 4: 가격 */}
        {FILTER_BTN_RANGE.slice(0, 4).map((nutr, nutrIdx) => (
          <RangeBtn key={nutr.name} btn={nutr} btnIdx={nutrIdx} />
        ))}
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default NutritionFilter;

const Container = styled.View`
  row-gap: 64px;
  margin-top: 48px;
`;
