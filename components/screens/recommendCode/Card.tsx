import styled from "styled-components/native";
import { Icon, Row, ShadowView, TextMain } from "@/shared/ui/styledComps";
import { ImageSourcePropType, ViewProps } from "react-native";
import colors from "@/shared/colors";

interface ICard extends ViewProps {
  icon?: ImageSourcePropType;
  label: string;
  value?: string;
}
const Card = ({ icon, label, value, ...boxProps }: ICard) => {
  return (
    <Box {...boxProps}>
      <Row>
        <Label>{label}</Label>
        {icon && <Icon source={icon} style={{ marginLeft: 4 }} />}
      </Row>
      {value && (
        <Highlight>
          <Value>{value || ""}</Value>
        </Highlight>
      )}
    </Box>
  );
};

export default Card;

const Box = styled(ShadowView)`
  width: 100%;
  height: 82px;
  border-radius: 10px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
`;

const Label = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
`;

const Highlight = styled.View`
  background-color: ${colors.highlight};
  align-items: center;
  justify-content: center;
  padding: 8px;
`;

const Value = styled(TextMain)`
  font-size: 18px;
  line-height: 22px;
  font-weight: bold;
`;
