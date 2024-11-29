import {ComponentProps, forwardRef} from 'react';
import {StyleProp, TextInput, ViewStyle} from 'react-native';
import styled from 'styled-components/native';
import colors from '../colors';
import {TextMain, TextSub} from './styledComps';

interface ISquareInput extends ComponentProps<typeof TextInput> {
  label: string;
  boxStyle?: StyleProp<ViewStyle>;
  errMsg?: string;
  isActive: boolean;
}
const SquareInput = forwardRef(
  ({label, boxStyle, errMsg, isActive, ...props}: ISquareInput, ref) => {
    return (
      <Box style={boxStyle}>
        <Label>{isActive && label}</Label>
        <Input
          placeholderTextColor={colors.textSub}
          isActive={isActive}
          isErr={!!errMsg}
          ref={ref}
          {...props}
        />
        <ErrorMsg>{errMsg ? errMsg : ''}</ErrorMsg>
      </Box>
    );
  },
);

export default SquareInput;

const Box = styled.View`
  width: 100%;
`;

interface IInput {
  isActive: boolean;
  isErr: boolean;
}
const Input = styled.TextInput<IInput>`
  width: 100%;
  height: 48px;
  background-color: ${({isActive}) =>
    isActive ? colors.white : colors.backgroundLight};
  border-radius: 5px;
  border-color: ${colors.lineLight};
  border-width: ${({isActive}) => (isActive ? 1 : 0)}px;

  font-size: 16px;
  include-font-padding: false;
  color: ${({isErr}) => (isErr ? colors.warning : colors.textMain)};
  line-height: 20px;

  margin-top: 2px;
  padding-left: 12px;
`;

const Label = styled(TextMain)`
  font-size: 11px;
  font-weight: bold;
  margin-left: 4px;
  line-height: 16px;
  height: 18px;
`;

const ErrorMsg = styled(TextSub)`
  font-size: 11px;
  margin: 2px 0px 0px 12px;
  color: ${colors.warning};
`;
