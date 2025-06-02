import { View, Text, Pressable } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useListDietTotalObj } from "../../../shared/api/queries/diet";
import { Icon } from "@/shared/ui/styledComps";
import { icons } from "@/shared/iconSource";
import CartSummary from "@/components/screens/diet/CartSummary";
import Toast from "react-native-toast-message";

const BottomInfo = () => {
  // useRef
  const ref = React.useRef<View>(null);

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // animation values to change height
  const CLOSED_HEIGHT = 68;
  const [contentHeight, setContentHeight] = useState(CLOSED_HEIGHT);
  const [opened, setOpened] = useState(false);
  const height = useSharedValue(CLOSED_HEIGHT);

  useEffect(() => {
    height.value = withSpring(opened ? contentHeight : CLOSED_HEIGHT, {
      duration: 1000,
    });
  }, [opened]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  useEffect(() => {
    if (ref.current) {
      ref.current.measure((x, y, width, height) => {
        setContentHeight(height + 32);
      });
    }
  }, [ref.current, dTOData]);

  return (
    <Container style={animatedStyle}>
      <ToggleBox onPress={() => setOpened((prev) => !prev)}>
        <Box ref={ref}>
          <Icon
            source={opened ? icons.arrowDown_20 : icons.arrowUp_20}
            style={{ position: "absolute", alignSelf: "center", top: 4 }}
            size={20}
          />
          <CartSummary
            hasLowerShippingCta={true}
            containerStyle={{
              backgroundColor: "",
              paddingHorizontal: 16,
              paddingTop: 32,
            }}
            mainTextColor={colors.inactive}
          />
        </Box>
      </ToggleBox>
    </Container>
  );
};

export default BottomInfo;

const Container = styled(Animated.View)`
  position: absolute;
  overflow: hidden;
  bottom: 0;
  left: 0;
  right: 0;
`;

const ToggleBox = styled(Pressable)`
  width: 100%;
  height: 100%;
  background-color: ${colors.blackOpacity80};
`;

const Box = styled(View)`
  width: 100%;
  height: auto;
`;
