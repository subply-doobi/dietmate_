import { Platform } from "react-native";
import styled from "styled-components/native";
import { TextMain } from "@/shared/ui/styledComps";
import { BOTTOM_INDICATOR_IOS, SCREENWIDTH } from "@/shared/constants";
import DSlider from "@/shared/ui/DSlider";
import { useEffect, useState } from "react";
import { getAutoMenuData, saveAutoMenuData } from "@/shared/utils/asyncStorage";
import { AM_PRICE_TARGET } from "@/shared/constants";
import CtaButton from "@/shared/ui/CtaButton";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setAMSettingProgress } from "@/features/reduxSlices/autoMenuSlice";
import { usePathname, useRouter } from "expo-router";

const Price = () => {
  // navigation
  const pathname = usePathname();
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.formula.formulaProgress);
  // local state for priceSliderValue
  const [priceSliderValue, setPriceSliderValue] = useState(AM_PRICE_TARGET);
  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const data = await getAutoMenuData();
      if (data?.priceSliderValue) setPriceSliderValue(data.priceSliderValue);
    })();
  }, []);
  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;
  return (
    <Container>
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
      <CtaButton
        btnStyle={"active"}
        style={{ position: "absolute", bottom: insetBottom + 8 }}
        btnText="다음"
        onPress={async () => {
          await saveAutoMenuData({ priceSliderValue });
          console.log("price: pathName: ", pathname);
          if (pathname.includes("Formula")) {
            dispatch(setFormulaProgress(progress.concat("AMProcessing")));
            return;
          }
          dispatch(setAMSettingProgress([]));
          router.back();
        }}
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
