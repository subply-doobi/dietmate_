import styled from 'styled-components/native';

import {Image, ViewStyle} from 'react-native';
import {icons} from '../iconSource';
import colors from '../colors';
import {TextMain} from './styledComps';

interface IDtooltip {
  color?: string;
  tooltipShow: boolean;
  text?: string;
  showIcon?: boolean;
  renderCustomIcon?: (() => React.ReactElement<Image>) | undefined;
  reversed?: boolean;
  boxBottom?: number;
  boxTop?: number;
  boxLeft?: number;
  boxRight?: number;
  triangle?: boolean;
  triangleLeft?: number;
  triangleRight?: number;
  onPressFn?: Function;
  style?: ViewStyle;
  customContent?: () => React.ReactElement;
}

/** tooltip 박스는 bottom | top | left | right 값 없을 때 bottom, left 기준.
 * triangleLeft, Right 는 tooltip박스 기준 꼭지점 위치
 */
const DTooltip = ({
  color,
  tooltipShow,
  text,
  showIcon,
  renderCustomIcon,
  reversed,
  boxBottom,
  boxTop,
  boxLeft,
  boxRight,
  triangle = true,
  triangleLeft,
  triangleRight,
  onPressFn,
  style,
  customContent,
}: IDtooltip) => {
  const boxVerticalStyle =
    boxBottom !== undefined
      ? {bottom: boxBottom}
      : boxTop !== undefined
        ? {top: boxTop}
        : {bottom: 0};
  const boxHorizontalStyle =
    boxLeft !== undefined
      ? {left: boxLeft}
      : boxRight !== undefined
        ? {right: boxRight}
        : {left: 0};
  const triangleHorizontalStyle =
    triangleLeft !== undefined
      ? {left: triangleLeft - 6}
      : triangleRight !== undefined
        ? {right: triangleRight - 6}
        : {left: 10};
  return tooltipShow ? (
    <Container
      style={{...boxVerticalStyle, ...boxHorizontalStyle, ...style}}
      onPress={() => (onPressFn ? onPressFn() : {})}>
      {reversed && triangle && (
        <TooltipTriangleRvs style={{...triangleHorizontalStyle}} />
      )}
      <TooltipBox color={color}>
        {customContent ? customContent() : <TooltipText>{text}</TooltipText>}
        {showIcon ? (
          renderCustomIcon ? (
            renderCustomIcon()
          ) : (
            <IconContainer>
              <CheckBox source={icons.checkboxCheckedWhite_24} />
            </IconContainer>
          )
        ) : null}
      </TooltipBox>
      {!reversed && triangle && (
        <TooltipTriangle color={color} style={{...triangleHorizontalStyle}} />
      )}
    </Container>
  ) : (
    <></>
  );
};

export default DTooltip;

const Container = styled.Pressable`
  position: absolute;
  margin: 0px 0px 6px 0px;
  z-index: 1000;
`;

const TooltipBox = styled.View<{color?: string}>`
  flex-direction: row;
  background-color: ${({color}) => (color ? color : colors.green)};
  padding: 5px;
  justify-content: center;
  align-items: flex-start;
  border-radius: 3px;
`;

const TooltipText = styled(TextMain)`
  font-size: 14px;
  color: ${colors.white};
  line-height: 18px;
`;

const IconContainer = styled.View`
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
`;

const CheckBox = styled.Image`
  width: 14px;
  height: 14px;
`;

const TooltipTriangle = styled.View<{color?: string}>`
  position: absolute;
  width: 0;
  height: 0;
  bottom: -6px;
  border-left-width: 6px;
  border-right-width: 6px;
  border-top-width: 9px;
  /* background-color: transparent; */
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${({color}) => (color ? color : colors.green)};
`;
const TooltipTriangleRvs = styled.View`
  position: absolute;
  width: 0;
  height: 0;
  top: -6px;
  border-left-width: 6px;
  border-right-width: 6px;
  border-bottom-width: 9px;
  background-color: transparent;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom-color: ${colors.warning};
`;
