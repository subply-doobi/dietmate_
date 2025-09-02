import styled from "styled-components/native";
import { TextSub } from "./styledComps";
import colors from "../colors";
import { TouchableOpacityProps } from "react-native";
import Icon, { IconName } from "./Icon";

interface IDSmallBtn extends TouchableOpacityProps {
  btnText: string;
  iconName?: IconName;
  iconSize?: number;
}
const DSmallBtn = ({ btnText, iconName, iconSize, ...props }: IDSmallBtn) => {
  const style = props.style || {};
  return (
    <Btn {...props} style={[style]}>
      <BtnText>{btnText}</BtnText>
      {iconName && <Icon iconSize={iconSize} name={iconName} />}
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
