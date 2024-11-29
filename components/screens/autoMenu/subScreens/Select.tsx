import { SetStateAction, useEffect } from "react";

import styled from "styled-components/native";

import MenuAcInactiveHeader from "@/components/menuAccordion/MenuAcInactiveHeader";
import { IDietTotalObjData } from "@/shared/api/types/diet";
import { Col } from "@/shared/ui/styledComps";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";

interface ISelect {
  dTOData: IDietTotalObjData;
  selectedDietNo: string[];
  setSelectedDietNo: React.Dispatch<SetStateAction<string[]>>;
}
const Select = ({ dTOData, selectedDietNo, setSelectedDietNo }: ISelect) => {
  // react-query
  const { data: bLData } = useGetBaseLine();

  // useEffect
  // 첫 렌더링 시 비어있는 끼니 자동으로 선택
  useEffect(() => {
    if (!dTOData) return;
    let emptyDietNoList: string[] = [];
    const dietNoArr = Object.keys(dTOData);
    for (let dietNo of dietNoArr) {
      dTOData[dietNo]?.dietDetail.length === 0 && emptyDietNoList.push(dietNo);
    }
    setSelectedDietNo((v) => [...emptyDietNoList]);
  }, []);

  // etc
  const onPress = (dietNo: string) => {
    if (selectedDietNo.includes(dietNo)) {
      setSelectedDietNo((v) => v.filter((value, i) => value !== dietNo));
      return;
    }
    setSelectedDietNo((v) => [...v, dietNo]);
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
