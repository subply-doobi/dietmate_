import styled from "styled-components/native";
import SelectBtn from "../SelectBtn";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { MENU_LABEL } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useEffect } from "react";
import { checkEveryMenuEmpty } from "@/shared/utils/sumUp";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";

const Method = () => {
  // redux
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.formula.formulaProgress);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const numOfMenu = Object.keys(dTOData || {}).length;

  useEffect(() => {
    if (!dTOData) return;
    if (numOfMenu === 0) {
      dispatch(setFormulaProgress(["SelectNumOfMenu"]));
      return;
    }
    const isEveryMenuEmpty = checkEveryMenuEmpty(dTOData);
    if (!isEveryMenuEmpty) {
      dispatch(setFormulaProgress(["Formula"]));
    }
  }, [dTOData]);

  // etc
  const METHOD_BTN = [
    {
      text: `자동으로 ${MENU_LABEL[numOfMenu - 1] || ""} 공식만들기`,
      subText:
        "극도로 귀찮으신 분들을 위해 근의공식이\n자동으로 목표영양을 모두 맞춘 공식을 만들게요",
      iconName: undefined,
      onPress: () => dispatch(setFormulaProgress(progress.concat("AMSelect"))),
    },
    {
      text: "한 근씩 공식만들기 (추천)",
      subText:
        "한 근씩 식품을 추가하면서 \n목표영양을 채우도록 근의공식이 도와줄게요",
      iconName: "appIcon",
      onPress: () => dispatch(setFormulaProgress(progress.concat("Formula"))),
    },
  ];
  return (
    <Container>
      <BtnBox>
        {METHOD_BTN.map((item, index) => (
          <SelectBtn
            key={index}
            text={item.text}
            subText={item.subText}
            iconName={item.iconName}
            leftBar={index === 2}
            onPress={item.onPress}
            iconDirection="right"
          />
        ))}
      </BtnBox>
    </Container>
  );
};

export default Method;

const Container = styled.View`
  flex: 1;
  padding-left: 16px;
  padding-right: 16px;
`;

const BtnBox = styled.View`
  position: absolute;
  bottom: 64px;
  width: 100%;
  row-gap: 24px;
  align-self: center;
`;
