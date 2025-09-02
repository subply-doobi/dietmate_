import styled from "styled-components/native";
import { Col, HorizontalLine, Row, TextMain } from "./styledComps";
import Icon from "./Icon";
import colors from "../colors";

interface IPageBtn {
  btns: {
    title: string;
    btnId: string;
    onPress: Function;
    iconName?: string;
    iconSize?: number;
  }[];
}

const ListBtns = ({ btns }: IPageBtn) => {
  return (
    <>
      {btns.map((item, index) => (
        <Col key={item.btnId}>
          <Btn onPress={() => item.onPress()}>
            <Row style={{ justifyContent: "space-between" }}>
              <Row>
                {item.iconName && (
                  <Icon
                    boxSize={24}
                    iconSize={item.iconSize || 18}
                    name={item.iconName as any}
                    style={{ marginRight: 12 }}
                  />
                )}
                <PageBtnText>{item.title}</PageBtnText>
              </Row>
              <Icon name="chevronRight" color={colors.textSub} />
            </Row>
          </Btn>
          {btns.length - 1 !== index && <HorizontalLine />}
        </Col>
      ))}
    </>
  );
};

export default ListBtns;

const Btn = styled.TouchableOpacity`
  width: 100%;
  height: 58px;
  justify-content: center;
`;
const PageBtnText = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
`;

const RightArrow = styled.Image`
  width: 20px;
  height: 20px;
`;
