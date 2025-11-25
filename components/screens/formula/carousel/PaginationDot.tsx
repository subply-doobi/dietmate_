import styled from "styled-components/native";
import colors from "@/shared/colors";
import { TextMain, TextSub } from "@/shared/ui/styledComps";
import { MENU_LABEL } from "@/shared/constants";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import Icon from "@/shared/ui/Icon";

const PaginationDot = ({ index }: { index: number }) => {
  // redux
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  const isActive = currentFMCIdx === index;
  const text = isActive ? MENU_LABEL[index].slice(-2) : MENU_LABEL[index];

  return (
    <PaginationDotView>
      {isActive && (
        <Icon
          name="appIcon"
          boxSize={18}
          iconSize={18}
          style={{ marginLeft: -4, marginRight: -4.5 }}
        />
      )}
      <PaginationText
        style={{ color: isActive ? colors.textMain : colors.textSub }}
      >
        {text}
      </PaginationText>
    </PaginationDotView>
  );
};

export default PaginationDot;

const PaginationDotView = styled.View`
  flex-direction: row;
  flex: 1;
  justify-content: center;
  align-items: center;
  z-index: 100;
  margin: 2.5px;
  border-color: ${colors.backgroundLight};
  border-radius: 16px;
  border-width: 1.5px;
`;

const PaginationText = styled(TextSub)`
  font-size: 10px;
  line-height: 14px;
`;
