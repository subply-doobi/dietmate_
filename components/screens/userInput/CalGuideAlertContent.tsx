import styled from "styled-components/native";
import { useListCode } from "@/shared/api/queries/code";
import { TextMain, TextSub } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import {
  KOREAN_NUTRITION_REFERENCE_URL,
  SCREENWIDTH,
  purposeCdToValue,
} from "@/shared/constants";
import { link } from "@/shared/utils/linking";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { getRecommendedNutr } from "@/shared/utils/screens/userInput/targetByUserInfo";

interface ICalGuideAlertContent {
  menuPerDay: number;
}
const CalGuideAlertContent = ({ menuPerDay }: ICalGuideAlertContent) => {
  // redux
  const userInputState = useAppSelector((state) => state.userInput);
  const dietPurposeCd = userInputState.dietPurposeCd;
  // react-query
  const { data: seqCodeData } = useListCode("SP008"); // SP008 : 운동빈도 (sportsSeqCd)
  const { data: timeCodeData } = useListCode("SP009"); // SP009 : 운동시간 (sportsTimeCd)
  const { data: strengthCodeData } = useListCode("SP010"); // SP010 : 운동강도 (sportsStrengthCd)

  // etc
  // 권장영양
  const recommendedNutr = getRecommendedNutr(
    seqCodeData,
    timeCodeData,
    strengthCodeData,
    userInputState
  );
  const { calorie, carb, protein, fat, tmr } = recommendedNutr;

  // text
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

  // nutr
  const caloriePerMenu = Math.round(Number(calorie) / menuPerDay);
  const carbPerMenu = Math.round(Number(carb) / menuPerDay);
  const proteinPerMenu = Math.round(Number(protein) / menuPerDay);
  const fatPerMenu = Math.round(Number(fat) / menuPerDay);

  const nutrItem = [
    {
      name: "칼로리",
      value: caloriePerMenu,
      unit: "kcal",
      color: colors.calorie,
    },
    { name: "탄수화물", value: carbPerMenu, unit: "g", color: colors.carb },
    { name: "단백질", value: proteinPerMenu, unit: "g", color: colors.protein },
    { name: "지방", value: fatPerMenu, unit: "g", color: colors.fat },
  ];

  return (
    <Container>
      <BaseText>고객님의 기초대사량과 활동대사량을 추정하여</BaseText>
      <BaseText>
        하루 총 사용하는 칼로리를 <BoldText>{`${tmr}kcal`}</BoldText>로
        계산했어요{"\n"}
      </BaseText>

      <BaseText>
        {purposeText}을 위해<BoldText> {additionalCalText}</BoldText>
      </BaseText>
      <BaseText>
        하루에 <BoldText>{`${Number(calorie)}kcal `}</BoldText>섭취하는 것을
        권장합니다{"\n"}
      </BaseText>
      <BaseText>
        평소 하루 <BoldText>{menuPerDay}끼를</BoldText> 드신다면
      </BaseText>
      <BaseText>근의공식으로 실천할 끼니 수와 평소 식사를 고려하여</BaseText>

      <BaseText>
        한 끼에{" "}
        <BoldText>
          {Math.round(caloriePerMenu * 0.85)}~
          {Math.round(caloriePerMenu * 1.15)}kcal
        </BoldText>{" "}
        사이를 권장합니다
        {"\n"}
      </BaseText>

      <BaseText>탄수화물, 단백질, 지방 비율은</BaseText>
      <LinkText onPress={() => link(KOREAN_NUTRITION_REFERENCE_URL)}>
        보건복지부 한국인 영양섭취기준(2020)
      </LinkText>
      <BaseText>에서 권장하는 비율로 설정했습니다.</BaseText>

      <Box>
        {nutrItem.map((item, idx) => (
          <NutrBox key={idx}>
            <Bar style={{ backgroundColor: item.color }} />
            <NutrText>{item.name}</NutrText>
            <NutrValue>{item.value + item.unit}</NutrValue>
          </NutrBox>
        ))}
      </Box>
    </Container>
  );
};

export default CalGuideAlertContent;

const Container = styled.View`
  width: 100%;
  padding: 32px 16px;
`;

const BaseText = styled(TextMain)`
  font-size: 12px;
`;
const BoldText = styled(TextMain)`
  font-size: 12px;
  font-weight: bold;
`;

const LinkText = styled(TextMain)`
  font-size: 12px;
  font-style: italic;
  text-decoration-line: underline;
`;

const Box = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  row-gap: 16px;
  margin-top: 40px;
`;

const NutrBox = styled.View`
  width: ${(SCREENWIDTH - 32 - 32) / 2}px;
  height: 32px;
  flex-direction: row;
  align-items: center;
`;
const Bar = styled.View`
  width: 6px;
  height: 32px;
  border-radius: 2px;
`;

const NutrText = styled(TextSub)`
  flex: 1;
  margin-left: 8px;
  font-size: 16px;
  line-height: 24px;
`;
const NutrValue = styled(TextMain)`
  flex: 1;
  font-size: 16px;
  line-height: 24px;
`;
