// RN, 3rd
import styled from "styled-components/native";
import * as Progress from "react-native-progress";

// util, const
import colors from "@/shared/colors";
import { Col, Row, VerticalSpace } from "@/shared/ui/styledComps";
import { sumUpNutrients } from "@/shared/utils/sumUp";

// doobi components
import { NUTR_ERROR_RANGE } from "@/shared/constants";

// react-query
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { IDietDetailData } from "@/shared/api/types/diet";

const indicatorColorsByTitle2: { [key: string]: string } = {
  "칼로리(kcal)": colors.main,
  "탄수화물(g)": colors.main,
  "단백질(g)": colors.main,
  "지방(g)": colors.main,
};

const nutrLowerBoundByTitle: { [key: string]: number } = {
  "칼로리(kcal)": NUTR_ERROR_RANGE["calorie"][0],
  "탄수화물(g)": NUTR_ERROR_RANGE["carb"][0],
  "단백질(g)": NUTR_ERROR_RANGE["protein"][0],
  "지방(g)": NUTR_ERROR_RANGE["fat"][0],
};

const nutrUpperBoundByTitle: { [key: string]: number } = {
  "칼로리(kcal)": NUTR_ERROR_RANGE["calorie"][1],
  "탄수화물(g)": NUTR_ERROR_RANGE["carb"][1],
  "단백질(g)": NUTR_ERROR_RANGE["protein"][1],
  "지방(g)": NUTR_ERROR_RANGE["fat"][1],
};

/** props:
 * 1. title '칼로리(g)' | '탄수화물(g)' | '단백질(g)' | '지방(g)'
 * 2. numerator(분자)
 * 3. denominator(분모) */
interface INutrientProgress {
  title: string;
  numerator: number;
  denominator: number;
}
const ProgressBar = ({ title, numerator, denominator }: INutrientProgress) => {
  const indicatorColor =
    numerator > denominator + nutrUpperBoundByTitle[title]
      ? colors.warning
      : numerator < denominator + nutrLowerBoundByTitle[title]
      ? indicatorColorsByTitle2[title]
      : colors.success;

  return (
    <ProgressBarContainer>
      <ProgressBarTitle>{title}</ProgressBarTitle>
      <Progress.Bar
        style={{ marginTop: 5 }}
        progress={numerator / denominator}
        width={null}
        height={4}
        color={indicatorColor}
        unfilledColor={colors.bgBox}
        borderWidth={0}
      />
      <ProgressBarNumber>{`${numerator}/${denominator}`}</ProgressBarNumber>
    </ProgressBarContainer>
  );
};

const NutrientsProgress = ({
  dietDetailData,
}: {
  dietDetailData: IDietDetailData;
  tooltipShow?: boolean;
}) => {
  // react-query
  const { data: baseLineData } = useGetBaseLine();

  // etc
  const { cal, carb, protein, fat } = sumUpNutrients(dietDetailData);

  return (
    <Container>
      <Col style={{ width: "100%", height: 70 }}>
        {baseLineData && Object.keys(baseLineData).length !== 0 && (
          <Row
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ProgressBar
              title="칼로리(kcal)"
              numerator={cal}
              denominator={
                Object.keys(baseLineData).length === 0
                  ? 0
                  : parseInt(baseLineData.calorie)
              }
            />
            <VerticalSpace width={8} />

            <ProgressBar
              title="탄수화물(g)"
              numerator={carb}
              denominator={
                Object.keys(baseLineData).length === 0
                  ? 0
                  : parseInt(baseLineData.carb)
              }
            />
            <VerticalSpace width={8} />

            <ProgressBar
              title="단백질(g)"
              numerator={protein}
              denominator={
                Object.keys(baseLineData).length === 0
                  ? 0
                  : parseInt(baseLineData.protein)
              }
            />
            <VerticalSpace width={8} />

            <ProgressBar
              title="지방(g)"
              numerator={fat}
              denominator={
                Object.keys(baseLineData).length === 0
                  ? 0
                  : parseInt(baseLineData.fat)
              }
            />
          </Row>
        )}
      </Col>
    </Container>
  );
};

export default NutrientsProgress;

const ProgressBarContainer = styled.View`
  flex: 1;
  height: 70px;
  justify-content: center;
`;

const ProgressBarTitle = styled.Text`
  font-size: 12px;
  color: ${colors.textMain};
  text-align: left;
`;
const ProgressBarNumber = styled.Text`
  font-size: 12px;
  margin-top: 5px;
  color: ${colors.textMain};
  text-align: right;
`;

const Container = styled.View`
  background-color: ${colors.white};
  width: 100%;
  align-items: center;
`;
