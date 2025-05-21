import styled from "styled-components/native";
import { Icon, Row, TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { IDietTotalObjData } from "@/shared/api/types/diet";
import { TouchableOpacityProps, ViewProps } from "react-native";
import { icons } from "@/shared/iconSource";

interface IAddMenuBtn extends TouchableOpacityProps {
  dTOData: IDietTotalObjData;
}
const AddMenuBtn = ({ dTOData, ...props }: IAddMenuBtn) => (
  <Btn {...props} style={{ boxShadow: " 2px 2px 5px rgba(0, 0, 0, 0.12)" }}>
    <BtnBar isActive={Object.keys(dTOData).length === 0} />
    <Row style={{ marginLeft: -10, columnGap: 4 }}>
      <Icon source={icons.appIcon} size={28} />
      <BtnText>추가</BtnText>
    </Row>
  </Btn>
);

export default AddMenuBtn;

const Btn = styled.TouchableOpacity`
  width: 100%;
  height: 48px;
  background-color: ${colors.white};
  border-radius: 5px;

  justify-content: center;
  align-items: center;
`;

const BtnText = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
  margin-left: 4px;
`;
const BtnBar = styled.View<{ isActive: boolean }>`
  width: 4px;
  height: 48px;
  position: absolute;
  left: 0px;
  background-color: ${({ isActive }) =>
    isActive ? colors.main : colors.inactive};

  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;
