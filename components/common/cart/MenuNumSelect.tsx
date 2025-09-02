import styled from "styled-components/native";
import colors from "@/shared/colors";
import { TextMain } from "@/shared/ui/styledComps";
import Icon from "@/shared/ui/Icon";

interface IMenuNumSelect {
  action: "openModal" | "setQty";
  disabled?: boolean;
  openMenuNumSelect?: Function;
  setQty?: React.Dispatch<React.SetStateAction<number>>;
  currentQty: number;
  maxQty?: number;
}
/** dummy인 경우 수량조절 bottomSheet 열어주고 아닌 경우 실제 수량조절 */
const MenuNumSelect = ({
  action,
  disabled = false,
  openMenuNumSelect,
  setQty,
  currentQty,
  maxQty,
}: IMenuNumSelect) => {
  // 1. 식품이 없거나 서버 오류로 dummy버튼인 경우
  //    == disabled prop 사용하면 홈화면 accordion이 닫히는 문제 때문에 onPress에 disabled 처리
  // 2. plusMinusBtn 만 disabled 인 경우
  //    == menuselect bottomsheet 열어주는 경우
  // 3. 버튼 박스만 disabled
  //    == 실제 수량조절 하는 경우
  const isPlusMinusBtnDisabled = action !== "setQty";
  const isMaxQty = maxQty && maxQty === currentQty ? true : false;
  return (
    <Box
      onPress={() => {
        if (disabled) return;
        action === "openModal" && openMenuNumSelect && openMenuNumSelect();
      }}
      disabled={action === "setQty"}
    >
      <PlusMinusBtn
        style={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}
        disabled={isPlusMinusBtnDisabled}
        onPress={() => !!setQty && setQty((v) => (v <= 1 ? v : v - 1))}
      >
        <Icon name="minus" color={colors.textSub} />
      </PlusMinusBtn>
      <MenuNoBox>
        <MenuNo>{currentQty}</MenuNo>
      </MenuNoBox>
      <PlusMinusBtn
        style={{ borderTopRightRadius: 5, borderBottomRightRadius: 5 }}
        disabled={isPlusMinusBtnDisabled || isMaxQty}
        onPress={() => !!setQty && setQty((v) => v + 1)}
      >
        {isMaxQty || <Icon name="plus" color={colors.textSub} />}
      </PlusMinusBtn>
    </Box>
  );
};

export default MenuNumSelect;

const Box = styled.TouchableOpacity`
  flex-direction: row;

  align-items: center;
  height: 32px;
`;

const PlusMinusBtn = styled.TouchableOpacity`
  width: 30px;
  height: 32px;
  justify-content: center;
  align-items: center;

  background-color: ${colors.backgroundLight2};
  border-color: ${colors.lineLight};
  border-width: 1px;
`;

const PlusMinusImg = styled.Image`
  width: 24px;
  height: 24px;
`;

const MenuNoBox = styled.View`
  width: 44px;
  height: 32px;
  background-color: ${colors.white};
  border-width: 1px;
  border-color: ${colors.lineLight};
  justify-content: center;
  align-items: center;
`;

const MenuNo = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
`;
