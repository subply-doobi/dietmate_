import styled from 'styled-components/native';
import React, {forwardRef} from 'react';
import {StyleProp, TextInput, TextInputProps, ViewProps} from 'react-native';
import colors from '../colors';
import {Col, InputHeaderText} from './styledComps';

interface IDTextInput extends TextInputProps {
  isActive: boolean;
  isValid: boolean;
  headerText?: string;
  boxStyle?: StyleProp<ViewProps>;
}
const DTextInput = forwardRef((p: IDTextInput, ref) => {
  const {headerText, boxStyle, ...props} = p;
  return (
    <Col style={boxStyle}>
      {headerText && (
        <InputHeader isActive={props.isActive}>{headerText}</InputHeader>
      )}
      <Input
        {...props}
        placeholderTextColor={colors.textSub}
        ref={ref}
        style={{
          includeFontPadding: false,
          fontFamily: 'NotoSansKR',
        }}
      />
    </Col>
  );
});

export default DTextInput;

const InputHeader = styled(InputHeaderText)``;

const Input = styled.TextInput<{
  isValid?: boolean;
  isActive?: boolean;
}>`
  height: 40px;
  justify-content: center;
  align-items: flex-start;
  font-size: 16px;
  color: ${({isValid}) => (isValid ? colors.textMain : colors.warning)};

  line-height: 24px;

  border-bottom-width: 1px;
  border-color: ${({isActive}) => (isActive ? colors.main : colors.inactive)};
  padding-bottom: 8px;
`;
