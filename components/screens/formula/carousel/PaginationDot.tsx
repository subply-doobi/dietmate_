import React, { useEffect, useMemo } from "react";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import { Icon, TextMain } from "@/shared/ui/styledComps";
import { MENU_LABEL } from "@/shared/constants";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { getNutrStatus } from "@/shared/utils/sumUp";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import Toast from "react-native-toast-message";

const PaginationDot = ({ index }: { index: number }) => {
  // redux
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const dietNo = Object.keys(dTOData || {})[index];
  const currentMenu = dTOData?.[dietNo]?.dietDetail || [];
  const nutrStatus = useMemo(() => {
    if (!dTOData) return;
    const nutrStatus = getNutrStatus({
      bLData: bLData,
      dDData: currentMenu,
      totalFoodList: totalFoodList,
    });

    return nutrStatus;
  }, [currentMenu]);

  useEffect(() => {
    if (nutrStatus === "satisfied" && currentFMCIdx === index) {
      Toast.show({
        type: "success",
        text1: "현재 근이 완료되었어요",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  }, [nutrStatus]);

  const isActive = currentFMCIdx === index;
  const text = isActive ? MENU_LABEL[index].slice(0, -2) : MENU_LABEL[index];

  const isSatisfied = nutrStatus === "satisfied";

  return (
    <PaginationDotView>
      <PaginationText>{text}</PaginationText>
      {isActive && (
        <Icon source={icons.appIcon} size={16} style={{ marginRight: -3 }} />
      )}
      {isSatisfied && (
        <Icon
          source={icons.checkboxCheckedGreen_24}
          size={10}
          style={{
            position: "absolute",
            right: -1,
            top: -1,
          }}
        />
      )}
    </PaginationDotView>
  );
};

export default PaginationDot;

const PaginationDotView = styled.View`
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: ${colors.white};
  border-radius: 6px;
  border-color: ${colors.inactive};
  border-width: 1px;
`;

const PaginationText = styled(TextMain)`
  color: ${colors.black};
  font-size: 11px;
  font-weight: bold;
  line-height: 16px;
`;
