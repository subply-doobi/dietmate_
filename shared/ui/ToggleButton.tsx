import {TouchableOpacityProps} from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import colors from '../colors';
import {TextMain} from './styledComps';

interface IToggleButton extends TouchableOpacityProps {
  isActive: boolean;
  label: string;
  onPress?: () => void;
}
const ToggleButton = ({isActive, label, onPress, ...props}: IToggleButton) => {
  return (
    <BtnToggle
      isActive={isActive}
      onPress={() => onPress && onPress()}
      {...props}>
      <ToggleText isActive={isActive}>{label}</ToggleText>
    </BtnToggle>
  );
};

export default ToggleButton;

const BtnToggle = styled.TouchableOpacity<{isActive: boolean}>`
  width: 100%;
  height: 48px;
  justify-content: center;
  align-items: center;
  border-width: ${({isActive}) => (isActive ? '0px' : '1px')};
  border-radius: 4px;
  border-color: ${colors.inactive};
  background-color: ${({isActive}) =>
    isActive ? colors.highlight : colors.white};
`;
const ToggleText = styled(TextMain)<{isActive: boolean}>`
  font-size: 16px;
  line-height: 20px;
  color: ${({isActive}) => (isActive ? colors.textMain : colors.textSub)};
`;
