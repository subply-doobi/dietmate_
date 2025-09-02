import styled from "styled-components/native";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { RefObject, useEffect, useState } from "react";
import { Col, HorizontalSpace, Row, TextMain } from "@/shared/ui/styledComps";
import ToggleButton from "@/shared/ui/ToggleButton";
import { useListCode } from "@/shared/api/queries/code";
import SquareInput from "@/shared/ui/SquareInput";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { getRecommendedNutr } from "@/shared/utils/screens/userInput/targetByUserInfo";
import { ScrollView } from "react-native";
import Icon from "@/shared/ui/Icon";
import colors from "@/shared/colors";

const menuPerDayItem = [1, 2, 3, 4];
const calorieOptionItem: {
  label: string;
  value: "light" | "normal" | "heavy" | "manual";
  multiplier: number;
}[] = [
  { label: "가볍게 먹을게요", value: "light", multiplier: 0.85 },
  { label: "평소와 비슷하게 먹을게요", value: "normal", multiplier: 1 },
  { label: "많이 먹을게요", value: "heavy", multiplier: 1.15 },
  { label: "칼로리를 직접 설정할게요", value: "manual", multiplier: 0 },
];

interface ITargetCalorie {
  scrollRef: RefObject<ScrollView>;
}
const TargetCalorie = ({ scrollRef }: ITargetCalorie) => {
  // redux
  const dispatch = useAppDispatch();
  const userInputState = useAppSelector((state) => state.userInput);

  // react-query
  const { data: seqCodeData } = useListCode("SP008"); // SP008 : 운동빈도 (sportsSeqCd)
  const { data: timeCodeData } = useListCode("SP009"); // SP009 : 운동시간 (sportsTimeCd)
  const { data: strengthCodeData } = useListCode("SP010"); // SP010 : 운동강도 (sportsStrengthCd)

  // useState
  const [menuPerDay, setMenuPerDay] = useState<number>(3);
  const [calorieOption, setCalorieOption] = useState<
    "normal" | "light" | "heavy" | "manual"
  >("normal");

  // etc
  const { calorie } = getRecommendedNutr(
    seqCodeData,
    timeCodeData,
    strengthCodeData,
    userInputState
  );

  const caloriePerMenu = Math.round(Number(calorie) / menuPerDay);

  // setValue
  const onCalorieOptionPressed = (
    option: "normal" | "light" | "heavy" | "manual"
  ) => {
    setCalorieOption(option);
    option === "manual" && dispatch(setValue({ name: "calorie", value: "" }));
  };

  useEffect(() => {
    const multiplier = calorieOptionItem.find(
      (item) => item.value === calorieOption
    )?.multiplier;
    dispatch(
      setValue({
        name: "calorie",
        value: multiplier
          ? String(Math.round(caloriePerMenu * multiplier))
          : String(Math.round(caloriePerMenu)),
      })
    );
  }, [caloriePerMenu, calorieOption]);

  return (
    <Container>
      <OptionTitle>평소 하루 끼니 수</OptionTitle>
      <Row style={{ width: "100%", columnGap: 8, marginTop: 24 }}>
        {menuPerDayItem.map((v, idx) => (
          <ToggleButton
            key={v}
            isActive={menuPerDay === v}
            label={`${v}끼`}
            style={{ flex: 1 }}
            onPress={() => setMenuPerDay(v)}
          />
        ))}
      </Row>

      <Row style={{ justifyContent: "space-between", marginTop: 64 }}>
        <OptionTitle>근의공식 한 끼 목표 칼로리</OptionTitle>
        <QuestionBtn
          onPress={() =>
            dispatch(
              openModal({
                name: "targetCalorieGuideAlert",
                values: { menuPerDay },
              })
            )
          }
        >
          <Icon name="questionCircle" color={colors.warning} />
        </QuestionBtn>
      </Row>

      <Col style={{ rowGap: 8, marginTop: 24 }}>
        {calorieOptionItem.map((item, idx) => (
          <ToggleButton
            key={item.value}
            isActive={calorieOption === item.value}
            label={item.label}
            onPress={() => {
              setCalorieOption(item.value);
              onCalorieOptionPressed(item.value);
            }}
          />
        ))}
      </Col>

      <HorizontalSpace height={24} />
      <SquareInput
        label={`한 끼 목표 칼로리 (권장 : ${caloriePerMenu}kcal)`}
        isActive={!!userInputState.calorie.value}
        value={userInputState.calorie.value}
        onChangeText={(v) => dispatch(setValue({ name: "calorie", value: v }))}
        errMsg={userInputState.calorie.errMsg}
        keyboardType="numeric"
        maxLength={4}
        placeholder={`한 끼 목표 칼로리 (권장 : ${caloriePerMenu}kcal)`}
        onFocus={() =>
          setTimeout(() => {
            scrollRef?.current?.scrollToEnd({ animated: true });
          }, 200)
        }
      />
    </Container>
  );
};

export default TargetCalorie;

const Container = styled.View`
  flex: 1;
`;

const OptionTitle = styled(TextMain)`
  font-size: 16px;
  line-height: 24px;
`;

const QuestionBtn = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;
