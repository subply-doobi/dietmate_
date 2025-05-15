import { Platform } from "react-native";
import styled from "styled-components/native";
import { TextMain } from "@/shared/ui/styledComps";
import { BOTTOM_INDICATOR_IOS, SCREENWIDTH } from "@/shared/constants";
import DSlider from "@/shared/ui/DSlider";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setPriceSliderValue } from "@/features/reduxSlices/autoMenuSlice";
import CtaButton from "@/shared/ui/CtaButton";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";

const Price = () => {
  // redux
  const dispatch = useAppDispatch();
  const priceSliderValue = useAppSelector(
    (state) => state.autoMenu.priceSliderValue
  );
  const progress = useAppSelector((state) => state.formula.formulaProgress);
  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;
  return (
    <Container>
      {/* 한 끼 가격 슬라이더 */}
      <OptionTitle>한 끼 가격</OptionTitle>
      <DSlider
        sliderValue={priceSliderValue}
        setSliderValue={(v) => dispatch(setPriceSliderValue(v))}
        minimumValue={6000}
        maximumValue={12000}
        value2LowerLimit={8000}
        step={1000}
        sliderWidth={SCREENWIDTH - 80}
      />
      <CtaButton
        btnStyle={"active"}
        style={{ position: "absolute", bottom: insetBottom + 8 }}
        btnText="다음"
        onPress={() =>
          dispatch(setFormulaProgress(progress.concat("AMProcessing")))
        }
      />
    </Container>
  );
};

export default Price;

const Container = styled.View`
  flex: 1;
  padding-left: 16px;
  padding-right: 16px;
`;

const OptionTitle = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  margin-top: 64px;
`;
