// RN, expo

// 3rd
import styled from "styled-components/native";

// doobi
import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";

import { IBaseLineData } from "@/shared/api/types/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { getNutrStatus, sumUpPrice, commaToNum } from "@/shared/utils/sumUp";
import { icons } from "@/shared/iconSource";

import colors from "@/shared/colors";
import { MENU_LABEL } from "@/shared/constants";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";
import { useMemo } from "react";
import { useRouter } from "expo-router";

interface IMenuAcActiveHeader {
  dietNo: string;
  bLData: IBaseLineData;
}
const MenuAcActiveHeader = ({ bLData, dietNo }: IMenuAcActiveHeader) => {
  // redux
  const dispatch = useAppDispatch();
  const router = useRouter();

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const { idx, currentQty } = useMemo(() => {
    const dDData = dTOData?.[dietNo]?.dietDetail ?? [];
    const idx =
      Object.keys(dTOData || {}).findIndex((key) => key === dietNo) || 0;
    const priceSum = sumUpPrice(dDData);
    const currentQty = dDData.length > 0 ? parseInt(dDData[0].qty, 10) : 1;
    return { idx, currentQty };
  }, [dTOData]);

  return (
    <Box>
      <Row style={{ alignItems: "flex-end", columnGap: 12 }}>
        <Title>{MENU_LABEL[idx]}</Title>
        {currentQty > 1 && <SubTitle>{`( x${currentQty} )`}</SubTitle>}
      </Row>
      <EditBtn
        onPress={() => {
          dispatch(setCurrentFMCIdx(idx));
          router.push({ pathname: "/(tabs)/Formula" });
        }}
      >
        <Icon source={icons.edit_24} />
      </EditBtn>
    </Box>
  );
};

export default MenuAcActiveHeader;

const Box = styled.View`
  width: 100%;
  height: 48px;
  flex-direction: row;
  background-color: ${colors.dark};
  align-items: center;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

const Title = styled(TextMain)`
  margin-left: 24px;
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;
  color: ${colors.white};
`;

const SubTitle = styled(TextSub)`
  color: ${colors.inactive};
  font-size: 14px;
  line-height: 18px;
`;

const EditBtn = styled.TouchableOpacity`
  position: absolute;
  right: 8px;
  width: 32px;
  height: 32px;

  align-self: center;
  justify-content: center;
  align-items: center;
`;
