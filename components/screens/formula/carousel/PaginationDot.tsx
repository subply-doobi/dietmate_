import React from "react";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import { Icon, TextMain } from "@/shared/ui/styledComps";
import { MENU_NUM_LABEL } from "@/shared/constants";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";

const PaginationDot = ({ index }: { index: number }) => {
  const currentFMCIdx = useAppSelector((state) => state.common.currentFMCIdx);
  const isActive = currentFMCIdx === index;
  const text = isActive
    ? MENU_NUM_LABEL[index].slice(0, -2)
    : MENU_NUM_LABEL[index];
  return (
    <PaginationDotView>
      <PaginationText>{text}</PaginationText>
      {isActive && (
        <Icon source={icons.appIcon} size={16} style={{ marginRight: -3 }} />
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
`;

const PaginationText = styled(TextMain)`
  color: ${colors.black};
  font-size: 11px;
  font-weight: bold;
  line-height: 16px;
`;
