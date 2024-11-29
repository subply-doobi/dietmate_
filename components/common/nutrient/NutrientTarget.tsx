import React from "react";
import styled from "styled-components/native";

import { TextMain } from "@/shared/ui/styledComps";
import { SCREENWIDTH } from "@/shared/constants";

interface INutrTarget {
  nutrient: string;
  value: string;
  color: string;
  onPress?: () => void;
}
const NutrTarget = ({ nutrient, value, color, onPress }: INutrTarget) => {
  return (
    <Container onPress={onPress ? onPress : () => {}}>
      <NutrValue>
        {nutrient === "칼로리" ? `${value} kcal` : `${value} g`}
      </NutrValue>
      <ColorBar color={color} />
      <Nutr>{nutrient}</Nutr>
    </Container>
  );
};

export default NutrTarget;

const Container = styled.TouchableOpacity`
  height: 50px;
  width: ${(SCREENWIDTH - 36) / 4}px;

  justify-content: center;
  align-items: center;
`;
const NutrValue = styled(TextMain)`
  font-size: 14px;
  font-weight: bold;
`;

const ColorBar = styled.View<{ color: string }>`
  width: 50px;
  height: 4px;
  margin-top: 4px;
  background-color: ${({ color }: { color: string }) => color};
`;
const Nutr = styled(TextMain)`
  margin-top: 4px;
  font-size: 12px;
`;
