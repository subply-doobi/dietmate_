import React, { useEffect } from "react";
import CartSummary from "@/components/screens/diet/CartSummary";
import { setDietQtyMap } from "@/features/reduxSlices/bottomSheetSlice";
import {
  useListDietTotalObj,
  useUpdateDietDetail,
} from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import styled from "styled-components/native";
import DietPlatformSummary from "@/components/summary/DietPlatformSummary";

const SummaryInfoFooterBSComp = () => {
  const dispatch = useAppDispatch();
  const { data: dTOData } = useListDietTotalObj();

  // Sync redux qty state when backend data changes
  useEffect(() => {
    dispatch(setDietQtyMap(dTOData));
  }, [dTOData, dispatch]);

  const updateDietDetailMutation = useUpdateDietDetail();
  const dietQtyMap = useAppSelector(
    (state) => state.bottomSheet.bsData.dietQtyMap
  );
  const changedDietNoArr = useAppSelector(
    (state) => state.bottomSheet.bsData.changedDietNoArr
  );

  // 취소: reset dietQtyMap to dTOData
  const handleCancel = () => {
    dispatch(setDietQtyMap(dTOData));
  };

  // 저장: update all changed diets
  const handleSave = () => {
    changedDietNoArr.forEach((dietNo) => {
      updateDietDetailMutation.mutate({
        dietNo,
        qty: String(dietQtyMap[dietNo]),
      });
    });
  };

  return (
    <Box>
      <BtnBox
        isChanged={changedDietNoArr.length > 0}
        pointerEvents={changedDietNoArr.length > 0 ? "auto" : "none"}
      >
        <FooterBtn onPress={handleCancel}>
          <FooterBtnText>취소</FooterBtnText>
        </FooterBtn>
        <FooterBtn onPress={handleSave} style={{ borderColor: colors.main }}>
          <FooterBtnText>근수 변경</FooterBtnText>
        </FooterBtn>
      </BtnBox>
      <DietPlatformSummary
        baseTextColor={colors.textSub}
        highlightColor={colors.green}
      />
    </Box>
  );
};

export default SummaryInfoFooterBSComp;

const Box = styled.View`
  width: 100%;
`;

const BtnBox = styled.View<{ isChanged: boolean }>`
  flex-direction: row;
  align-items: center;
  height: 56px;
  opacity: ${({ isChanged }) => (isChanged ? 1 : 0)};
  margin-top: -56px;
  padding: 0 16px;
  column-gap: 8px;
`;
const FooterBtn = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${colors.line};
  background-color: ${colors.blackOpacity80};
`;
const FooterBtnText = styled.Text`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.white};
`;
