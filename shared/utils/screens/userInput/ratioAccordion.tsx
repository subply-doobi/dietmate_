// RN, expo
import { RefObject, useRef } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

import colors from "@/shared/colors";
import {
  calculateCaloriesToNutr,
  calculateManualCalorie,
} from "@/shared/utils/targetCalculation";
import { ICodeData } from "@/shared/api/types/code";
import { commaToNum } from "@/shared/utils/sumUp";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { SCREENWIDTH } from "@/shared/constants";

import {
  Col,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import SquareInput from "@/shared/ui/SquareInput";
import { ScrollView } from "react-native";
import Icon from "@/shared/ui/Icon";

const AcHeader = ({
  isActive,
  title,
}: {
  isActive: boolean;
  title: string;
}) => {
  return (
    <AccordionHeader isActive={isActive}>
      <Row>
        <Icon
          name="checkbox"
          color={isActive ? colors.main : colors.inactive}
          boxSize={24}
          iconSize={20}
        />
        <AccordionHeaderTitle isActive={isActive}>{title}</AccordionHeaderTitle>
      </Row>
      <Icon
        name={isActive ? "chevronUp" : "chevronDown"}
        color={isActive ? colors.main : colors.line}
      />
    </AccordionHeader>
  );
};

const AcNutrBox = ({
  calorie,
  carb,
  protein,
  fat,
}: {
  calorie: string;
  carb: string;
  protein: string;
  fat: string;
}) => {
  const cal = commaToNum(parseInt(calorie, 10));
  const nutrItems = [
    { name: "칼로리", value: cal, unit: "kcal" },
    { name: "탄수화물", value: carb, unit: "g" },
    { name: "단백질", value: protein, unit: "g" },
    { name: "지방", value: fat, unit: "g" },
  ];
  return (
    <AccordionContentBox>
      <NutrBox>
        {nutrItems.map((item, idx) => (
          <Col key={item.name} style={{ flex: 1, alignItems: "center" }}>
            <NutrTitle>{item.name}</NutrTitle>
            <NutrValue>{`${item.value} ${item.unit}`}</NutrValue>
          </Col>
        ))}
      </NutrBox>
    </AccordionContentBox>
  );
};

const AcManualInputs = ({
  scrollRef,
}: {
  scrollRef: RefObject<ScrollView>;
}) => {
  // react-query
  const { data: baseLineData } = useGetBaseLine();

  // redux
  const dispatch = useAppDispatch();
  const { calorie, carb, protein, fat } = useAppSelector(
    (state) => state.userInput
  );

  // useRef
  const inputRef = useRef([]);

  // etc
  // 결정된 칼로리로 계산된 권장 carb, protein, fat
  const {
    carb: carbAuto,
    protein: proteinAuto,
    fat: fatAuto,
  } = calculateCaloriesToNutr("SP005001", calorie.value);

  const { totalCalorie, carbRatio, proteinRatio, fatRatio } =
    calculateManualCalorie(carb.value, protein.value, fat.value);

  const scrollByManualStep = (step: number) => {
    // guideTextMargin 48 + 64 title: 32 subTitle: 24 gap: 16
    // acHeader height: 52 gap: 20
    // SquareInput label: 18 input: 48 errMsg: 11 gap: 24
    const guideTextPart = 48 + 64 + 32 * 2 + 16 + 24 * 2;
    const acHeaderPart = (52 + 20) * 4;
    const manualContentTopOffset = 24 + 18 + 24;
    const squareInputPart = (18 + 48 + 11 + 4) * step;
    const targetY =
      guideTextPart + acHeaderPart + manualContentTopOffset + squareInputPart;
    setTimeout(() => {
      scrollRef?.current?.scrollTo({
        y: targetY,
        animated: true,
      });
    }, 150);
  };

  return (
    <Col style={{ width: SCREENWIDTH - 48, alignSelf: "center" }}>
      {baseLineData && Object.keys(baseLineData).length !== 0 && (
        <Row style={{ marginTop: 24 }}>
          <Icon name="warningCircle" color={colors.warning} iconSize={16} />
          <CautionMsg>
            칼로리가 변경될 수 있어요 (기존설정:{" "}
            <CautionMsgRed>{calorie.value}kcal</CautionMsgRed>)
          </CautionMsg>
        </Row>
      )}
      <HorizontalSpace height={24} />
      <SquareInput
        isActive={!!carb.value}
        label={`탄수화물 양 (권장: ${carbAuto}g)`}
        value={carb.value}
        onChangeText={(v) => dispatch(setValue({ name: "carb", value: v }))}
        errMsg={carb.errMsg}
        keyboardType="numeric"
        maxLength={3}
        placeholder={`탄수화물 양을 입력해주세요 (권장: ${carbAuto}g)`}
        onSubmitEditing={() => inputRef.current[0]?.focus()}
        onFocus={() => scrollByManualStep(0)}
      />
      <SquareInput
        isActive={!!protein.value}
        label={`단백질 양 (권장: ${proteinAuto}g)`}
        value={protein.value}
        onChangeText={(v) => dispatch(setValue({ name: "protein", value: v }))}
        errMsg={protein.errMsg}
        keyboardType="numeric"
        maxLength={3}
        placeholder={`단백질 양을 입력해주세요 (권장: ${proteinAuto}g)`}
        boxStyle={{ marginTop: 4 }}
        ref={(el) => {
          inputRef ? (inputRef.current[0] = el) : null;
        }}
        onSubmitEditing={() => inputRef.current[1]?.focus()}
        onFocus={() => scrollByManualStep(1)}
      />
      <SquareInput
        isActive={!!fat.value}
        label={`지방 양 (권장: ${fatAuto}g)`}
        value={fat.value}
        onChangeText={(v) => dispatch(setValue({ name: "fat", value: v }))}
        errMsg={fat.errMsg}
        keyboardType="numeric"
        maxLength={3}
        placeholder={`지방 양을 입력해주세요 (권장: ${fatAuto}g)`}
        boxStyle={{ marginTop: 4 }}
        ref={(el) => {
          inputRef ? (inputRef.current[1] = el) : null;
        }}
        onFocus={() => scrollByManualStep(2)}
      />
      <HorizontalSpace height={40} />
      <NutrBox
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Row>
          <ManualText>칼로리</ManualText>
          <ManualTextValue>{totalCalorie} kcal</ManualTextValue>
        </Row>
        <Row style={{ marginTop: 4 }}>
          <ManualText>탄단지 비율</ManualText>
          <ManualTextValue>
            {carbRatio} : {proteinRatio} : {fatRatio}
          </ManualTextValue>
        </Row>
      </NutrBox>
    </Col>
  );
};

export const getRatioAcContent = (
  ratioCodeData: ICodeData,
  calorie: string,
  scrollRef: React.RefObject<ScrollView>
) => {
  const manualContent = {
    activeHeader: <AcHeader isActive={true} title="영양성분 직접 설정" />,
    inactiveHeader: <AcHeader isActive={false} title="영양성분 직접 설정" />,
    content: <AcManualInputs scrollRef={scrollRef} />,
  };
  const ratioContent = ratioCodeData.map((item) => {
    const { carb, protein, fat } = calculateCaloriesToNutr(item.cd, calorie);

    return {
      activeHeader: <AcHeader isActive={true} title={item.cdNm} />,
      inactiveHeader: <AcHeader isActive={false} title={item.cdNm} />,
      content: (
        <AcNutrBox calorie={calorie} carb={carb} protein={protein} fat={fat} />
      ),
    };
  });
  return [...ratioContent, manualContent];
};

const AccordionContentBox = styled.View`
  padding: 16px 8px 24px 8px;
`;

const AccordionHeader = styled.View<{ isActive: boolean }>`
  flex-direction: row;
  height: 52px;
  background-color: ${({ isActive }) =>
    isActive ? colors.highlight : colors.white};
  border-width: ${({ isActive }) => (isActive ? 0 : 1)}px;
  border-color: ${colors.inactive};
  border-radius: 4px;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 8px;
`;

const AccordionHeaderTitle = styled.Text<{ isActive: boolean }>`
  font-size: 16px;
  line-height: 22px;
  color: ${({ isActive }) => (isActive ? colors.main : colors.textSub)};
  margin-left: 16px;
`;

const CautionMsg = styled(TextMain)`
  font-size: 12px;
  line-height: 17px;
  margin-left: 4px;
`;
const CautionMsgRed = styled(TextMain)`
  font-size: 12px;
  line-height: 17px;
  color: ${colors.warning};
`;

const NutrBox = styled.View`
  width: 100%;
  height: 58px;
  flex-direction: row;

  border-color: ${colors.main};
  border-width: 1px;
  border-radius: 5px;

  align-items: center;
  justify-content: space-between;
`;

const NutrTitle = styled(TextSub)`
  font-size: 12px;
`;
const NutrValue = styled(TextMain)`
  font-size: 12px;
  margin-top: 4px;
`;

const ManualText = styled(TextSub)`
  width: 80px;
  font-size: 12px;
  margin-left: 24px;
`;
const ManualTextValue = styled(TextMain)`
  font-size: 12px;
`;
