import styled from 'styled-components/native';
import {Icon, TextSub} from './styledComps';
import {icons} from '../iconSource';
import colors from '../colors';
import {TouchableOpacityProps} from 'react-native';

interface IDSmallBtn extends TouchableOpacityProps {
  btnText: string;
  iconSource?: string;
  iconSize?: number;
}
const DSmallBtn = ({btnText, iconSource, iconSize, ...props}: IDSmallBtn) => {
  return (
    <Btn {...props}>
      <BtnText>{btnText}</BtnText>
      {iconSource && (
        <Icon
          size={iconSize || 20}
          source={iconSource || icons.arrowRight_20}
        />
      )}
    </Btn>
  );
};

export default DSmallBtn;

const Btn = styled.TouchableOpacity`
  flex-direction: row;
  background-color: ${colors.white};
  border-radius: 5px;

  justify-content: center;
  align-items: center;
  column-gap: 4px;

  padding: 8px 16px;
`;

const BtnText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  color: ${colors.textSub};
`;
