import { View, Text } from "react-native";
import React, { SetStateAction } from "react";
import styled from "styled-components/native";
import { TextMain } from "@/shared/ui/styledComps";
import { SCREENWIDTH } from "@/shared/constants";
import DSlider from "@/shared/ui/DSlider";

interface IPrice {
  priceSliderValue: number[];
  setPriceSliderValue: React.Dispatch<SetStateAction<number[]>>;
}
const Price = ({ priceSliderValue, setPriceSliderValue }: IPrice) => {
  return (
    <View>
      {/* 한 끼 가격 슬라이더 */}
      <OptionTitle>한 끼 가격</OptionTitle>
      <DSlider
        sliderValue={priceSliderValue}
        setSliderValue={setPriceSliderValue}
        minimumValue={6000}
        maximumValue={12000}
        value2LowerLimit={8000}
        step={1000}
        sliderWidth={SCREENWIDTH - 80}
      />
    </View>
  );
};

export default Price;

const OptionTitle = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  margin-top: 64px;
`;
