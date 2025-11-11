import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Foundation from "@expo/vector-icons/Foundation";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import { View, ViewStyle } from "react-native";
import colors from "../colors";
import styled from "styled-components/native";

const iconMap = {
  // appIcon
  appIcon: {
    kind: undefined,
    name: "app-icon",
  },

  // tabBar
  home: {
    kind: Ionicons,
    name: "home-sharp",
  },
  homeOutline: {
    kind: Ionicons,
    name: "home-outline",
  },
  calculator: {
    kind: MaterialCommunityIcons,
    name: "calculator-variant",
  },
  calculatorOutline: {
    kind: MaterialCommunityIcons,
    name: "calculator-variant-outline",
  },
  cart: {
    kind: Ionicons,
    name: "cart-sharp",
  },
  cartOutline: {
    kind: Ionicons,
    name: "cart-outline",
  },

  // +/-
  plus: {
    kind: Entypo,
    name: "plus",
  },
  minus: {
    kind: Entypo,
    name: "minus",
  },
  plusCircle: {
    kind: MaterialCommunityIcons,
    name: "plus-circle",
  },
  plusSquare: {
    kind: FontAwesome6,
    name: "plus-square",
  },
  minusSquare: {
    kind: FontAwesome6,
    name: "minus-square",
  },
  cancelCircle: {
    kind: MaterialIcons,
    name: "cancel",
  },
  // change
  changeCircle: {
    kind: MaterialIcons,
    name: "change-circle",
  },

  // check
  check: {
    kind: MaterialCommunityIcons,
    name: "check-bold",
  },
  checkCircle: {
    kind: MaterialIcons,
    name: "check-circle",
  },
  checkCircleUnchecked: {
    kind: MaterialIcons,
    name: "radio-button-unchecked",
  },
  checkbox: {
    kind: MaterialIcons,
    name: "check-box",
  },
  checkboxUnchecked: {
    kind: MaterialIcons,
    name: "check-box-outline-blank",
  },

  // arrow
  arrowLeft: {
    kind: FontAwesome6,
    name: "arrow-left",
  },
  chevronLeft: {
    kind: Feather,
    name: "chevron-left",
  },
  chevronRight: {
    kind: Feather,
    name: "chevron-right",
  },
  chevronUp: {
    kind: Feather,
    name: "chevron-up",
  },
  chevronDown: {
    kind: Feather,
    name: "chevron-down",
  },

  // error, warning
  wifiOff: {
    kind: MaterialIcons,
    name: "wifi-off",
  },
  warningCircle: {
    kind: FontAwesome6,
    name: "circle-exclamation",
  },

  // mypage
  questionCircle_mp: {
    kind: AntDesign,
    name: "questioncircle",
  },
  target_mp: {
    kind: Foundation,
    name: "target",
  },
  code_mp: {
    kind: Entypo,
    name: "code",
  },
  heart_mp: {
    kind: MaterialIcons,
    name: "favorite",
  },
  card_mp: {
    kind: MaterialIcons,
    name: "credit-card",
  },
  notice_mp: {
    kind: MaterialCommunityIcons,
    name: "note",
  },
  account_mp: {
    kind: MaterialCommunityIcons,
    name: "account-circle",
  },
  chat_mp: {
    kind: Ionicons,
    name: "chatbubbles",
  },

  // sort / filter
  sort: {
    kind: FontAwesome5,
    name: "sort",
  },
  sortUp: {
    kind: FontAwesome5,
    name: "sort-up",
  },
  sortDown: {
    kind: FontAwesome5,
    name: "sort-down",
  },
  target: {
    kind: Foundation,
    name: "target",
  },
  search: {
    kind: Feather,
    name: "search",
  },
  truck: {
    kind: MaterialCommunityIcons,
    name: "truck",
  },
  eye: {
    kind: MaterialCommunityIcons,
    name: "eye",
  },

  // etc
  refresh: {
    kind: MaterialIcons,
    name: "refresh",
  },
  heart: {
    kind: Ionicons,
    name: "heart-sharp",
  },
  heartBorder: {
    kind: Ionicons,
    name: "heart-outline",
  },
  creditCard: {
    kind: MaterialIcons,
    name: "credit-card",
  },
  calendar: {
    kind: MaterialIcons,
    name: "calendar-month",
  },
  food: {
    kind: MaterialIcons,
    name: "fastfood",
  },
  questionCircle: {
    kind: AntDesign,
    name: "questioncircle",
  },
  userCircle: {
    kind: FontAwesome6,
    name: "user-circle",
  },
  more: {
    kind: MaterialIcons,
    name: "more-vert",
  },
  infoCircle: {
    kind: MaterialIcons,
    name: "info",
  },
  edit: {
    kind: MaterialIcons,
    name: "edit",
  },
  setting: {
    kind: Ionicons,
    name: "settings-outline",
  },
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  color?: string;
  iconSize?: number;
  boxSize?: number;
  style?: ViewStyle;
}

const Icon: React.FC<IconProps> = ({
  name,
  color = colors.black,
  iconSize = 18,
  boxSize = 20,
  style,
  ...rest
}) => {
  const IconComponent = iconMap[name]?.kind;
  if (name !== "appIcon" && !IconComponent) {
    console.log("Icon: name error (icon name does not exist)", name);
    return null;
  }
  return (
    <View
      style={[
        {
          width: boxSize,
          height: boxSize,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {name === "appIcon" ? (
        <Image
          source={require("../assets/appIcon/appIcon.png")}
          style={{ width: iconSize, height: iconSize }}
        />
      ) : (
        <IconComponent
          name={iconMap[name].name}
          size={iconSize}
          color={color}
          {...rest}
        />
      )}
    </View>
  );
};

export default Icon;

const Image = styled.Image``;
