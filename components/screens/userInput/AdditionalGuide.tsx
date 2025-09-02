// 3rd
import styled from "styled-components/native";

// doobi
import { TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { ViewProps } from "react-native";
import Icon, { IconName } from "@/shared/ui/Icon";

interface IAdditionalGuide extends ViewProps {
  iconName: IconName;
  iconColor: string;
  text: string;
}

const AdditionalGuide = ({
  iconName,
  iconColor,
  text,
  ...props
}: IAdditionalGuide) => {
  return (
    <AdditionalGuideBox {...props}>
      <Icon name={iconName} color={iconColor} />
      <AdditionalGuideText>{text}</AdditionalGuideText>
    </AdditionalGuideBox>
  );
};

export default AdditionalGuide;

const AdditionalGuideBox = styled.View`
  width: 100%;
  background-color: ${colors.backgroundLight2};
  border-radius: 10px;
  padding: 16px;
`;

const AdditionalGuideText = styled(TextMain)`
  font-size: 16px;
  margin-top: 8px;
  line-height: 24px;
`;
