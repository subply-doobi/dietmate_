import colors from "@/shared/colors";
import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { ImageSourcePropType, TouchableOpacityProps } from "react-native";
import styled from "styled-components/native";

interface ISelectBtn extends TouchableOpacityProps {
  text: string;
  subText?: string;
  leftBar?: boolean;
  iconSource?: ImageSourcePropType;
  iconDirection?: "left" | "right";
}
const SelectBtn = ({
  text,
  subText,
  leftBar,
  iconSource,
  iconDirection = "left",
  ...props
}: ISelectBtn) => {
  const style = props.style || {};
  const isIconLeft = iconDirection === "left";
  return (
    <Btn
      {...props}
      style={[
        {
          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
        },
        style,
      ]}
    >
      <Row style={{ columnGap: 8 }}>
        {iconSource && isIconLeft && <Icon source={iconSource} size={32} />}
        <BtnText>{text}</BtnText>
        {iconSource && !isIconLeft && <Icon source={iconSource} size={32} />}
      </Row>

      {subText && <BtnSubText>{subText}</BtnSubText>}
      {leftBar && <LeftBar />}
    </Btn>
  );
};

export default SelectBtn;

const Btn = styled.TouchableOpacity`
  width: 99%;
  border-radius: 8px;
  padding: 24px 16px;
  justify-content: center;
  border-width: 1px;
  border-color: ${colors.lineLight};
  background-color: ${colors.white};
`;

const BtnText = styled(TextMain)`
  font-size: 18px;
  font-weight: bold;
  line-height: 24px;
`;

const BtnSubText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  margin-top: 8px;
`;

const LeftBar = styled.View`
  width: 4px;
  position: absolute;
  left: 0px;
  top: 0px;
  bottom: 0px;
  background-color: ${colors.main};
  border-radius: 8px 0px 0px 8px;
`;
