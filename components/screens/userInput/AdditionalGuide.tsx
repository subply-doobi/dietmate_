// 3rd
import styled from "styled-components/native";

// doobi
import { Icon, TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { ImageSourcePropType, ViewProps } from "react-native";

interface IAdditionalGuide extends ViewProps {
  iconSource: ImageSourcePropType;
  text: string;
}

const AdditionalGuide = ({ iconSource, text, ...props }: IAdditionalGuide) => {
  return (
    <AdditionalGuideBox {...props}>
      <Icon source={iconSource} />
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
  line-height: 20px;
`;
