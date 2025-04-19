import { Alert, TouchableOpacity, TouchableOpacityProps } from "react-native";
import styled from "styled-components/native";

import { icons } from "../iconSource";
import { usePathname, useRouter } from "expo-router";

const Back = styled.Image`
  width: 24px;
  height: 24px;
`;

const BackArrow = ({
  goBackFn,
  style,
}: {
  goBackFn?: Function;
  style?: TouchableOpacityProps["style"];
}) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPressIn={() => {
        goBackFn ? goBackFn() : router.back();
      }}
      style={[
        {
          width: 36,
          height: 36,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Back source={icons.back_24} />
    </TouchableOpacity>
  );
};

export default BackArrow;
