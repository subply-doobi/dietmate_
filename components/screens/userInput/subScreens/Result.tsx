// RN

// 3rd
import styled from "styled-components/native";

// doobi
import { useListCode } from "@/shared/api/queries/code";
import { Col, Row, TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";
import { IUserInputState } from "@/features/reduxSlices/userInputSlice";
import { calculateManualCalorie } from "@/shared/utils/targetCalculation";
import { ShadowView } from "@/shared/ui/styledComps";
import {
  KOREAN_NUTRITION_REFERENCE_URL,
  purposeCdToValue,
} from "@/shared/constants";
import { link } from "@/shared/utils/linking";
import AdditionalGuide from "../AdditionalGuide";
import { getRecommendedNutr } from "@/shared/utils/screens/userInput/targetByUserInfo";

const Result = ({ userInputState }: { userInputState: IUserInputState }) => {
  // react-query
  const { data: seqCodeData } = useListCode("SP008"); // SP008 : 운동빈도 (sportsSeqCd)
  const { data: timeCodeData } = useListCode("SP009"); // SP009 : 운동시간 (sportsTimeCd)
  const { data: strengthCodeData } = useListCode("SP010"); // SP010 : 운동강도 (sportsStrengthCd)

  // input state
  const {
    weight,
    ratio,
    calorie,
    carb,
    protein,
    fat,
    targetOption: targetOptionState,
    dietPurposeCd,
  } = userInputState;

  // 권장영양
  const recommendedNutr = getRecommendedNutr(
    seqCodeData,
    timeCodeData,
    strengthCodeData,
    userInputState
  );
  const { calorie: calorieAuto, tmr } = recommendedNutr;

  // 칼로리 비율
  const { totalCalorie, carbRatio, proteinRatio, fatRatio } =
    calculateManualCalorie(carb.value, protein.value, fat.value);

  const purposeText = purposeCdToValue[dietPurposeCd.value].targetText;
  const calorieModText =
    purposeCdToValue[dietPurposeCd.value].additionalCalorieText;
  const additionalCal = Number(
    purposeCdToValue[dietPurposeCd.value].additionalCalorie
  );
  const purpose =
    additionalCal === 0 ? "유지" : additionalCal > 0 ? "증량" : "감량";

  const additionalCalText =
    purpose === "유지"
      ? ""
      : purpose === "증량"
      ? `하루에 ${calorieModText}을 추가하여`
      : `하루에 ${calorieModText}을 제한하여`;

  const targetOption = targetOptionState.value[0] === 3 ? "manual" : "ratio";

  // 각 영양소 표시
  const nutrItems = [
    {
      name: "칼로리",
      value: targetOption === "ratio" ? calorie.value : totalCalorie,
      unit: "kcal",
      color: colors.calorie,
    },
    {
      name: "탄수화물",
      value: carb.value,
      unit: "g",
      color: colors.carb,
    },
    {
      name: "단백질",
      value: protein.value,
      unit: "g",
      color: colors.protein,
    },
    {
      name: "지방",
      value: fat.value,
      unit: "g",
      color: colors.fat,
    },
  ];

  return (
    <Container>
      <Row style={{ alignItems: "center" }}>
        <Col style={{ flex: 1, rowGap: 16 }}>
          {nutrItems.map((item, idx) => (
            <NutrBox key={idx}>
              <LeftBar style={{ backgroundColor: item.color }}></LeftBar>
              <Col style={{ marginLeft: 12 }}>
                <NutrText
                  style={{ color: colors.textSub }}
                >{`${item.name}`}</NutrText>
                <NutrText>{`${item.value} ${item.unit}`}</NutrText>
              </Col>
            </NutrBox>
          ))}
        </Col>
        <ShadowView style={{ flex: 1.5, borderRadius: 5 }}>
          <TMIBox>
            <Col style={{ padding: 16 }}>
              <BaseText>고객님의 기초대사량과</BaseText>
              <BaseText>활동대사량을 고려하여</BaseText>
              <BaseText>하루 총 사용하는 칼로리는</BaseText>
              <BaseText>
                <BoldText>{`${tmr}kcal`}</BoldText>로 추정됩니다{"\n"}
              </BaseText>

              <BaseText>
                <BoldText>{purposeText}</BoldText>을 위해
              </BaseText>

              <BaseText>{additionalCalText}</BaseText>
              <BaseText>하루 목표섭취량으로</BaseText>
              <BaseText>
                <BoldText>{`${calorieAuto}kcal`}</BoldText>를 권장합니다{"\n"}
              </BaseText>

              {targetOption === "ratio" ? (
                <BaseText>
                  한 끼 칼로리 <BoldText>{`${calorie.value}kcal`}</BoldText>와
                  {"\n"}
                  선택한 영양비율{" "}
                  <BoldText>
                    {carbRatio}:{proteinRatio}:{fatRatio}
                  </BoldText>
                  에 따라{"\n"}한 끼니의 목표 영양을 정했어요
                </BaseText>
              ) : (
                <>
                  <BaseText>고객님이 입력한 탄:단:지</BaseText>
                  <BaseText>
                    <BoldText>{`${carb.value}g : ${protein.value}g : ${fat.value}g`}</BoldText>{" "}
                    로
                  </BaseText>
                  <BaseText>
                    총 {totalCalorie}kcal로 계산되었어요{"\n"}
                  </BaseText>
                  {Number(protein) >=
                    Math.round((Number(weight.value) * 2.5) / 3) && (
                    <BaseText>
                      고객님 체중 기준으로{"\n"} "하루" 섭취 총 단백질 양이
                      {"\n"}
                      <BoldText>
                        {Math.round(Number(weight.value) * 2.5)}g
                      </BoldText>{" "}
                      을 초과하지는 않도록
                      {"\n"}
                      설정해주세요{"\n"}
                    </BaseText>
                  )}
                </>
              )}
              <LinkText onPress={() => link(KOREAN_NUTRITION_REFERENCE_URL)}>
                {"\n"}보건복지부 한국인 영양섭취기준(2020)
              </LinkText>
            </Col>
          </TMIBox>
        </ShadowView>
      </Row>
      <AdditionalGuide
        style={{ marginTop: 40 }}
        iconSource={icons.warning_24}
        text={`근의공식에서 구성한 끼니 외 식사량이나,
몸무게 변화에 따라 목표섭취량은 달라집니다.

결정한 목표섭취량으로 식단 실천을 해보시고
필요하다면 50~100kcal 정도씩 변경해보세요

홈화면 "정보변경"으로 언제든 수정할 수 있어요.`}
      />
    </Container>
  );
};

export default Result;

const Container = styled.View`
  flex: 1;
`;

const NutrBox = styled.View`
  flex-direction: row;
  width: 100%;
  height: 58px;
  align-items: center;
`;
const LeftBar = styled.View`
  width: 4px;
  height: 100%;
`;

const NutrText = styled(TextMain)`
  font-size: 16px;
`;

const TMIBox = styled.View`
  background-color: ${colors.backgroundLight};
  border-radius: 10px;
  margin-right: 4px;
`;

const BaseText = styled(TextMain)`
  font-size: 12px;
`;
const BoldText = styled(TextMain)`
  font-size: 12px;
  font-weight: bold;
`;

const LinkText = styled.Text`
  font-size: 12px;
  font-style: italic;
  color: ${colors.textLink};
  text-decoration-line: underline;
`;
