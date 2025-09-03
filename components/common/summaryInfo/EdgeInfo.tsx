import { View, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useListDietTotalObj } from "../../../shared/api/queries/diet";
import CartSummary from "@/components/screens/diet/CartSummary";
import Icon, { IconName } from "@/shared/ui/Icon";

interface IEdgeInfo {
  visible?: boolean;
  position?: "absolute" | "relative";
  direction?: "top" | "bottom";
  closeddHeight?: number;
}
const EdgeInfo = ({
  visible = true,
  position = "absolute",
  direction = "bottom",
  closeddHeight = 68,
}: IEdgeInfo) => {
  // useRef
  const ref = React.useRef<View>(null);

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // animation values to change height
  const CLOSED_HEIGHT = closeddHeight;
  const [contentHeight, setContentHeight] = useState(CLOSED_HEIGHT);
  const [opened, setOpened] = useState(false);
  const height = useSharedValue(CLOSED_HEIGHT);

  useEffect(() => {
    height.value = withSpring(opened ? contentHeight : CLOSED_HEIGHT, {
      duration: 1000,
    });
  }, [opened]);

  useEffect(() => {
    if (ref.current) {
      ref.current.measure((x, y, width, height) => {
        setContentHeight(height + 32);
      });
    }
  }, [ref.current, dTOData]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const containerStyle = {
    top: direction === "top" ? 0 : undefined,
    bottom: direction === "bottom" ? 0 : undefined,
    position,
  };

  const iconName: IconName =
    opened && direction === "top"
      ? "chevronUp"
      : opened && direction === "bottom"
      ? "chevronDown"
      : !opened && direction === "top"
      ? "chevronDown"
      : "chevronUp";

  if (!visible) {
    return null;
  }

  return (
    <Container style={[containerStyle, animatedStyle]}>
      <ToggleBox onPress={() => setOpened((prev) => !prev)}>
        <Box ref={ref}>
          <Icon
            name={iconName}
            style={{ position: "absolute", alignSelf: "center", top: 4 }}
            boxSize={24}
            iconSize={18}
            color={colors.inactive}
          />
          <CartSummary
            hasLowerShippingCta={true}
            containerStyle={{
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

export default EdgeInfo;

const Container = styled(Animated.View)`
  position: absolute;
  overflow: hidden;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
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
