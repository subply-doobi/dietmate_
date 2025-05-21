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
import { MENU_NUM_LABEL } from "@/shared/constants";

interface IMenuAcActiveHeader {
  dietNo: string;
  bLData: IBaseLineData;
}
const MenuAcActiveHeader = ({ bLData, dietNo }: IMenuAcActiveHeader) => {
  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const dDData = dTOData?.[dietNo]?.dietDetail ?? [];
  const idx =
    Object.keys(dTOData || {}).findIndex((key) => key === dietNo) || 0;

  // etc
  const priceSum = sumUpPrice(dDData);
  const nutrStatus = getNutrStatus({ totalFoodList, bLData, dDData });
  const iconSource =
    nutrStatus === "satisfied"
      ? icons.checkRoundCheckedGreen_24
      : icons.warning_24;

  return (
    <Box>
      <Row>
        <Title>{MENU_NUM_LABEL[idx]}</Title>
        {/* {(nutrStatus === 'satisfied' || nutrStatus === 'exceed') && (
          <Icon style={{marginLeft: 4}} size={20} source={iconSource} />
        )} */}
      </Row>
      <SubTitle>{`${commaToNum(priceSum)}원 (${
        dDData.length
      }가지 식품)`}</SubTitle>
      <DeleteBtn
        onPress={() =>
          dispatch(
            openModal({
              name: "menuDeleteAlert",
              values: { dietNoToDel: dietNo },
            })
          )
        }
      >
        <Icon source={icons.cancelRound_24} />
      </DeleteBtn>
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
  justify-content: space-between;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

const Title = styled(TextMain)`
  margin-left: 16px;
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;
  color: ${colors.white};
`;

const SubTitle = styled(TextSub)`
  color: ${colors.white};
  font-size: 14px;
  margin-right: 56px;
  line-height: 18px;
`;

const DeleteBtn = styled.TouchableOpacity`
  position: absolute;
  right: 8px;
  width: 32px;
  height: 32px;

  align-self: center;
  justify-content: center;
  align-items: center;
`;
