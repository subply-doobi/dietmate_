import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { useRouter } from "expo-router";
import Icon from "./Icon";
import colors from "../colors";

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
      <Icon name="arrowLeft" color={colors.black} boxSize={24} iconSize={20} />
    </TouchableOpacity>
  );
};

export default BackArrow;
