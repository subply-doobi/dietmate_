import styled from "styled-components/native";
import { Col, TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";

import { updateSelectedBtn } from "@/features/reduxSlices/sortFilterSlice";
import { commaToNum } from "@/shared/utils/sumUp";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const checkIsPressed = (selectedBtn: number[], currentBtn: number) => {
  if (selectedBtn.length === 0) return false;
  if (selectedBtn.length === 1) return selectedBtn[0] === currentBtn;

  return selectedBtn[0] <= currentBtn && currentBtn <= selectedBtn[1];
};

const RangeBtn = ({
  btn,
  btnIdx,
}: {
  btn: { name: string; unit: string; label: string; value: number[][] };
  btnIdx: number;
}) => {
  // redux
  const dispatch = useAppDispatch();
  const {
    copied: {
      filter: { selectedBtn, nutrition, price },
    },
  } = useAppSelector((state) => state.sortFilter);

  /** name => "calorie" | "carb" | "protein" | "fat"  ||
   * btnIdx => 범위 버튼 (0~20 | 20~40) etc */
  const handleBtnOnPress = (name: string, btnIdx: number) => {
    dispatch(updateSelectedBtn({ [name]: btnIdx }));
  };

  // nutr or price
  const isNutr = btn.name !== "price";
  const isFiltered = isNutr
    ? nutrition[btn.name]?.length === 2
    : price.length === 2;
  const nutrLB = isNutr && isFiltered ? `${nutrition[btn.name]?.[0]} ~ ` : "";
  const nutrUB = isNutr && isFiltered ? `${nutrition[btn.name]?.[1]}` : "";
  const priceLB = !isNutr && isFiltered ? `${price[0]} ~ ` : "";
  const priceUB = !isNutr && isFiltered ? `${price[1]}` : "";
  const lowerBound = isNutr ? nutrLB : priceLB;
  const upperBound = isNutr ? nutrUB : priceUB;
  return (
    <Col>
      <Label>{`${btn.label} (${lowerBound}${upperBound}${btn.unit})`}</Label>
      <BtnContainer>
        {btn.value.map((b, i) => {
          const isPressed = checkIsPressed(selectedBtn[btn.name], i);
          return (
            <Btn
              key={i}
              isActive={isPressed}
              onPress={() => handleBtnOnPress(btn.name, i)}
            >
              <BtnText isActive={isPressed}>{`${commaToNum(b[0])}~${commaToNum(
                b[1]
              )}`}</BtnText>
            </Btn>
          );
        })}
      </BtnContainer>
    </Col>
  );
};

export default RangeBtn;

const Label = styled(TextMain)`
  font-size: 16px;
`;

const BtnContainer = styled.View`
  margin-top: 16px;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Btn = styled.TouchableOpacity<{ isActive: boolean }>`
  width: 72px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border-width: 1px;
  border-color: ${({ isActive }: { isActive: boolean }) =>
    isActive ? colors.main : colors.inactive};
  background-color: ${colors.white};
`;

const BtnText = styled(TextMain)<{ isActive: boolean }>`
  font-size: 11px;
  color: ${({ isActive }: { isActive: boolean }) =>
    isActive ? colors.textMain : colors.textSub};
`;
