import { StyleProp, TextStyle, TouchableOpacityProps } from "react-native";
import React, { ReactNode, forwardRef } from "react";
import styled from "styled-components/native";
import { Row, TextMain } from "./styledComps";
import colors from "../colors";
import { ShadowView } from "./styledComps";

type IBtnStyle =
  | "active"
  | "activeDark"
  | "inactive"
  | "border"
  | "borderActive"
  | "borderActiveDark"
  | "kakao"
  | string;
interface ICtaButton extends TouchableOpacityProps {
  shadow?: boolean;
  btnStyle: IBtnStyle;
  btnTextStyle?: StyleProp<TextStyle>;
  btnText?: string;
  btnContent?: () => ReactNode;
  bottomFloat?: boolean;
}
const CtaButton = forwardRef((p: ICtaButton, ref) => {
  const {
    shadow,
    btnStyle,
    btnTextStyle,
    btnText,
    btnContent,
    bottomFloat,
    style,
    ...props
  } = p;

  const shadowStyle = shadow
    ? {
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.12)",
      }
    : {};

  return (
    <BtnCTA
      ref={ref}
      btnStyle={btnStyle}
      disabled={btnStyle === "inactive" ? true : false}
      bottomFloat={bottomFloat}
      style={[style, { ...shadowStyle }]}
      {...props}
    >
      <Row style={{ columnGap: 4 }}>
        {btnContent && btnContent()}
        {btnText && (
          <BtnText btnStyle={btnStyle} style={btnTextStyle}>
            {btnText}
          </BtnText>
        )}
      </Row>
    </BtnCTA>
  );
});

export default CtaButton;

interface IBtnCTA {
  btnStyle?: IBtnStyle;
  bottomFloat?: boolean;
}
const BtnCTA = styled.TouchableOpacity<IBtnCTA>`
  height: 52px;
  width: 100%;
  border-radius: 4px;

  background-color: ${({ btnStyle }) =>
    btnStyle === "active"
      ? `${colors.main}`
      : btnStyle === "activeDark"
      ? `${colors.dark}`
      : btnStyle === "inactive"
      ? `${colors.inactive}`
      : btnStyle === "border"
      ? `${colors.white}`
      : btnStyle === "kakao"
      ? `${colors.kakaoColor}`
      : `${colors.white}`};
  align-items: center;
  align-self: center;
  justify-content: center;
  border-width: ${({ btnStyle }) =>
    btnStyle === "border" ||
    btnStyle === "borderActive" ||
    btnStyle === "borderActiveDark"
      ? "1px"
      : "0px"};
  border-color: ${({ btnStyle }) =>
    btnStyle === "border"
      ? colors.inactive
      : btnStyle === "borderActive"
      ? colors.main
      : btnStyle === "borderActiveDark"
      ? colors.dark
      : colors.white};
`;

interface IBtnText {
  btnStyle?: IBtnStyle;
}
const BtnText = styled(TextMain)<IBtnText>`
  font-size: 16px;
  line-height: 20px;
  color: ${({ btnStyle }) =>
    btnStyle === "active" ||
    btnStyle === "activeDark" ||
    btnStyle === "inactive"
      ? `${colors.white}`
      : btnStyle === "border"
      ? `${colors.textSub}`
      : `${colors.textMain}`};
`;
