import styled from 'styled-components/native';

import colors from '../colors';
import {SCREENWIDTH} from '../constants';
import {ViewProps} from 'react-native';

export const NotoSansLight = styled.Text`
  font-family: 'NotoSansKRLight';
  color: ${colors.textMain};
  include-font-padding: false;
`;
export const NotoSansRegular = styled.Text`
  font-family: 'NotoSansKR';
  color: ${colors.textMain};
  include-font-padding: false;
`;
export const NotoSansMedium = styled.Text`
  font-family: 'NotoSansKRMedium';
  color: ${colors.textMain};
  include-font-padding: false;
`;
export const NotoSansBold = styled.Text`
  font-family: 'NotoSansKRBold';
  color: ${colors.textMain};
  include-font-padding: false;
`;
export const NotoSansBlack = styled.Text`
  font-family: 'NotoSansKRBlack';
  color: ${colors.textMain};
  include-font-padding: false;
`;
export const NotoSansThin = styled.Text`
  font-family: 'NotoSansKRThin';
  color: ${colors.textMain};
  include-font-padding: false;
`;
export const NotoSansLight_Sub = styled.Text`
  font-family: 'NotoSansKRLight';
  color: ${colors.textSub};
  include-font-padding: false;
`;
export const NotoSansRegular_Sub = styled.Text`
  font-family: 'NotoSansKR';
  color: ${colors.textSub};
  include-font-padding: false;
`;
export const NotoSansMedium_Sub = styled.Text`
  font-family: 'NotoSansKRMedium';
  color: ${colors.textSub};
  include-font-padding: false;
`;
export const NotoSansBold_Sub = styled.Text`
  font-family: 'NotoSansKRBold';
  color: ${colors.textSub};
  include-font-padding: false;
`;
export const NotoSansBlack_Sub = styled.Text`
  font-family: 'NotoSansKRBlack';
  color: ${colors.textSub};
  include-font-padding: false;
`;
export const NotoSansThin_Sub = styled.Text`
  font-family: 'NotoSansKRThin';
  color: ${colors.textSub};
  include-font-padding: false;
`;

export const TextMain = styled.Text`
  color: ${colors.textMain};
`;

export const TextSub = styled.Text`
  color: ${colors.textSub};
  font-weight: 300;
`;

const SafeView = styled.SafeAreaView`
  flex: 1;
  background-color: ${colors.white};
`;
const PaddingView = styled.View`
  flex: 1;
  padding: 0px 16px 0px 16px;
`;
export const Container = ({children, ...props}: ViewProps) => {
  return (
    <SafeView>
      <PaddingView {...props}>{children}</PaddingView>
    </SafeView>
  );
};

export const AlertContentContainer = styled.View`
  padding: 28px 16px 28px 16px;
`;

interface IInputHeaderText {
  isActive?: boolean;
}
export const InputHeaderText = styled(TextMain)<IInputHeaderText>`
  font-size: 14px;
  color: ${({isActive}) => (isActive ? colors.textMain : colors.white)};
`;

export const InputHeader = styled(InputHeaderText)`
  margin-top: 24px;
`;

export const ErrorText = styled.Text`
  font-size: 16px;
  color: #ffffff;
`;
export const ErrorBox = styled.View`
  position: relative;
  align-self: flex-end;
  z-index: 1;

  width: auto;
  height: 24px;
  background-color: ${colors.warning};
  opacity: 0.9;

  border-radius: 3px;

  margin-top: 4px;
  margin-bottom: -28px;
  padding: 0px 10px 0px 10px;
`;

export const AccordionContentContainer = styled.View`
  /* width: ${`${SCREENWIDTH}px`}; */
  width: 100%;
  height: auto;
  background-color: ${colors.white};
  padding: 16px 16px 32px 16px;
  /* row-gap: 40px; */
`;

export const InputContainer = styled.View`
  width: 100%;
  height: 58px;
  padding-top: 24px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;
export const Col = styled.View``;

export const Seperator = styled.View`
  height: 16px;
`;

/** props 1. btnStyle -> "activated" | "inactivated" | "border" | "borderActivated" | "kakao"
 *  props 2. height -> height: ${p => p.height ?? 52}px
 *  props 3. width -> width: ${p => p.width ?? `${SCREENWIDTH - 32}`}px;
 */
interface IBtnCTA {
  height?: number;
  width?: number;
  btnStyle?: 'activated' | 'inactivated' | 'border' | 'kakao' | 'borderActive';
  btnColor?: string;
}
export const BtnCTA = styled.TouchableOpacity<IBtnCTA>`
  height: ${({height}) => (height ? `${height}px` : '52px')};
  width: ${({width}) => (width ? `${width}px` : '100%')};
  border-radius: 4px;
  background-color: ${({btnStyle, btnColor}) =>
    btnColor
      ? btnColor
      : btnStyle === 'activated'
        ? `${colors.main}`
        : btnStyle === 'inactivated'
          ? `${colors.inactive}`
          : btnStyle === 'border'
            ? `${colors.white}`
            : btnStyle === 'kakao'
              ? `${colors.kakaoColor}`
              : `${colors.white}`};
  align-items: center;
  align-self: center;
  justify-content: center;
  border-width: ${({btnStyle}) =>
    btnStyle === 'border' || btnStyle === 'borderActive' ? '1px' : '0px'};
  border-color: ${({btnStyle}) =>
    btnStyle === 'border'
      ? colors.inactive
      : btnStyle === 'borderActive'
        ? colors.main
        : colors.white};
`;

export const BtnBottomCTA = styled(BtnCTA)`
  align-self: center;
  margin-top: -60px;
  margin-bottom: 8px;
  elevation: 8;
`;

export const StickyFooter = styled.View`
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  margin-left: 16px;
  margin-right: 16px;
  align-items: center;
  padding: 0px 8px 0px 8px;
`;

interface IBtnSmall {
  isActivated?: boolean;
}
export const BtnSmall = styled.TouchableOpacity<IBtnSmall>`
  height: 32px;
  width: 74px;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  background-color: ${({isActivated}) =>
    isActivated ? colors.inactive : colors.white};
  border-width: 1px;
  border-color: ${colors.inactive};
`;

export const BtnText = styled.Text`
  color: ${colors.white};
  font-size: 16px;
`;

interface IBtnSmallText {
  isActivated?: boolean;
}
export const BtnSmallText = styled.Text<IBtnSmallText>`
  font-size: 14px;
  color: ${({isActivated}) => (isActivated ? colors.textMain : colors.textSub)};
  line-height: 18px;
`;

interface IVerticalLine {
  height?: number;
  width?: number;
}
export const VerticalLine = styled.View<IVerticalLine>`
  height: ${({height}) => (height ? `${height}px` : '100%')};
  width: ${({width}) => (width ? `${width}px` : `1px`)};
  background-color: ${colors.inactive};
`;

interface IHorizontalLine {
  width?: number;
  lineColor?: string;
}
export const HorizontalLine = styled.View<IHorizontalLine>`
  height: 1px;
  width: ${({width}) => (width ? `${width}px` : '100%')};
  background-color: ${({lineColor}) =>
    lineColor ? lineColor : colors.lineLight};
`;

interface IHorizontalSpace {
  height?: number;
}
export const HorizontalSpace = styled.View<IHorizontalSpace>`
  width: 100%;
  height: ${({height}) => `${height}px`};
`;

interface IVerticalSpace {
  width?: number;
}
export const VerticalSpace = styled.View<IVerticalSpace>`
  height: 100%;
  width: ${({width}) => `${width}px`};
  background-color: ${colors.white};
`;

interface IDot {
  backgroundColor?: string;
}
export const Dot = styled.View<IDot>`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background-color: ${({backgroundColor}) => `${backgroundColor}`};
`;

interface IIcon {
  size?: number;
}
export const Icon = styled.Image<IIcon>`
  width: ${({size}) => (size ? `${size}px` : '24px')};
  height: ${({size}) => (size ? `${size}px` : '24px')};
`;

export const ShadowView = styled.View<{opacity?: number}>`
  background-color: ${colors.white};
  background-color: #fff;
  shadow-color: #000;
  shadow-offset: 1px 3px;
  shadow-opacity: ${({opacity}) => (opacity ? opacity : 0.14)};
  shadow-radius: 3.84px;
  elevation: 3;
`;
