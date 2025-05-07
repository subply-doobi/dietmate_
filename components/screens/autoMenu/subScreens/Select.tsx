import { SetStateAction, useEffect } from "react";

import styled from "styled-components/native";

import MenuAcInactiveHeader from "@/components/menuAccordion/MenuAcInactiveHeader";
import { Col } from "@/shared/ui/styledComps";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setSelectedDietNo } from "@/features/reduxSlices/autoMenuSlice";

const Select = () => {
  // redux
  const dispatch = useAppDispatch();
  const selectedDietNo = useAppSelector(
    (state) => state.autoMenu.selectedDietNo
  );

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

  return (
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
  );
};

export default Select;

const MenuSelectBtn = styled.TouchableOpacity``;
