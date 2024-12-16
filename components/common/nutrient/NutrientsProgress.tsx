// RN, 3rd
import styled from "styled-components/native";
import * as Progress from "react-native-progress";
import { useEffect, useMemo, useState } from "react";

// util, const
import colors from "@/shared/colors";
import { Col, Row } from "@/shared/ui/styledComps";
import { sumUpNutrients } from "@/shared/utils/sumUp";

// doobi components
import { NUTR_ERROR_RANGE } from "@/shared/constants";

// react-query
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { IDietDetailData } from "@/shared/api/types/diet";

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
  const [color, setColor] = useState(colors.main);
  const progress = numerator / denominator;

  useEffect(() => {
    const indicatorColor =
      numerator > denominator + nutrUpperBoundByTitle[title]
        ? colors.warning
        : numerator < denominator + nutrLowerBoundByTitle[title]
        ? colors.main
        : colors.success;
    setTimeout(() => {
      setColor(indicatorColor);
    }, 500);
  }, [numerator]);

  return (
    <ProgressBarContainer>
      <ProgressBarTitle>{title}</ProgressBarTitle>
      <Progress.Bar
        key={`${title}_${color}`}
        style={{ marginTop: 5 }}
        progress={progress}
        width={null}
        height={4}
        color={color}
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
  const PROGRESS_ITEM = useMemo(() => {
    const { cal, carb, protein, fat } = sumUpNutrients(dietDetailData);
    const PROGRESS_ITEM = [
      {
        id: "calorie",
        title: "칼로리(kcal)",
        nutr: cal,
        baseline: parseInt(baseLineData?.calorie || "0"),
      },
      {
        id: "carb",
        title: "탄수화물(g)",
        nutr: carb,
        baseline: parseInt(baseLineData?.carb || "0"),
      },
      {
        id: "protein",
        title: "단백질(g)",
        nutr: protein,
        baseline: parseInt(baseLineData?.protein || "0"),
      },
      {
        id: "fat",
        title: "지방(g)",
        nutr: fat,
        baseline: parseInt(baseLineData?.fat || "0"),
      },
    ];

    return PROGRESS_ITEM;
  }, [dietDetailData, baseLineData]);

  return (
    <Container>
      <Col style={{ width: "100%", height: 70 }}>
        {baseLineData && Object.keys(baseLineData).length !== 0 && (
          <Row
            style={{
              alignItems: "center",
              justifyContent: "center",
              columnGap: 8,
            }}
          >
            {PROGRESS_ITEM.map((item) => (
              <ProgressBar
                key={item.id}
                title={item.title}
                numerator={item.nutr}
                denominator={item.baseline}
              />
            ))}
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
