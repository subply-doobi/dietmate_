import { useEffect } from "react";

import styled from "styled-components/native";

import MenuAcInactiveHeader from "@/components/menuAccordion/MenuAcInactiveHeader";
import { Col } from "@/shared/ui/styledComps";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setSelectedDietNo } from "@/features/reduxSlices/autoMenuSlice";
import { Platform, ScrollView } from "react-native";
import CtaButton from "@/shared/ui/CtaButton";
import { BOTTOM_INDICATOR_IOS } from "@/shared/constants";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";

const Select = () => {
  // redux
  const dispatch = useAppDispatch();
  const selectedDietNo = useAppSelector(
    (state) => state.autoMenu.selectedDietNo
  );
  const progress = useAppSelector((state) => state.formula.formulaProgress);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();

  // useEffect
  // 첫 렌더링 시 비어있는 끼니 자동으로 선택
  useEffect(() => {
    if (!dTOData) return;
    let emptyDietNoList: string[] = [];
    const dietNoArr = Object.keys(dTOData);
    for (let dietNo of dietNoArr) {
      dTOData[dietNo]?.dietDetail.length === 0 && emptyDietNoList.push(dietNo);
    }
    dispatch(setSelectedDietNo([...emptyDietNoList]));
  }, []);

  // 모든 끼니 비어있으면 카테고리 선택으로 이동
  useEffect(() => {
    if (!dTOData) return;
    const dietNoArr = Object.keys(dTOData);
    const menuLengthList = dietNoArr.map(
      (dietNo) => dTOData[dietNo].dietDetail.length
    );
    if (menuLengthList.every((m: number) => m === 0)) {
      dispatch(setSelectedDietNo(dietNoArr.map((dietNo) => dietNo)));
      const newProgress = progress
        .filter((item) => item !== "AMSelect")
        .concat("AMCategory");
      dispatch(setFormulaProgress(newProgress));
      return;
    }
  }, []);

  // etc
  const onPress = (dietNo: string) => {
    if (selectedDietNo.includes(dietNo)) {
      dispatch(
        setSelectedDietNo(selectedDietNo.filter((value, i) => value !== dietNo))
      );
      return;
    }

    dispatch(setSelectedDietNo([...selectedDietNo, dietNo]));
  };
  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;
  return (
    <Container>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Col style={{ rowGap: 20, marginTop: 64 }}>
          {bLData &&
            dTOData &&
            Object.keys(dTOData).map((dietNo, idx) => (
              <MenuSelectBtn key={idx} onPress={() => onPress(dietNo)}>
                <MenuAcInactiveHeader
                  controllable={false}
                  dietNo={dietNo}
                  bLData={bLData}
                  selected={selectedDietNo.includes(dietNo)}
                  leftBarInactive={true}
                />
              </MenuSelectBtn>
            ))}
        </Col>
      </ScrollView>
      <CtaButton
        btnStyle={selectedDietNo?.length === 0 ? "inactive" : "active"}
        style={{ position: "absolute", bottom: insetBottom + 8 }}
        btnText="다음"
        onPress={() =>
          dispatch(setFormulaProgress(progress.concat("AMCategory")))
        }
      />
    </Container>
  );
};

export default Select;

const MenuSelectBtn = styled.TouchableOpacity``;

const Container = styled.View`
  flex: 1;
  padding-left: 16px;
  padding-right: 16px;
`;
