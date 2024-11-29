import styled from 'styled-components/native';
import colors from '../colors';
import {ViewProps} from 'react-native';
import {Col, Icon, Row, TextMain, TextSub} from './styledComps';
import {icons} from '../iconSource';

interface IAccordionHeader extends ViewProps {
  title: string;
  subTitle?: string | null;
  isActive?: boolean;
  arrow?: boolean;
  customComponent?: () => React.ReactNode;
}
const DAccordionHeader = ({
  title,
  subTitle,
  isActive = false,
  arrow = true,
  customComponent,
  ...props
}: IAccordionHeader) => {
  return (
    <AccordionHeader {...props}>
      <Row style={{justifyContent: 'space-between', flex: 1}}>
        <Col style={{flex: 1}}>
          <Title>{title}</Title>
          {customComponent &&
            typeof customComponent === 'function' &&
            customComponent()}
          {!isActive && subTitle && <SubTitle>{subTitle}</SubTitle>}
        </Col>
        {arrow &&
          (isActive ? (
            <Icon size={20} source={icons.arrowUp_20} />
          ) : (
            <Icon size={20} source={icons.arrowDown_20} />
          ))}
      </Row>
    </AccordionHeader>
  );
};

export default DAccordionHeader;

const AccordionHeader = styled.View`
  width: 100%;
  background-color: ${colors.white};
  padding: 24px 16px;
`;

const Title = styled(TextMain)`
  font-size: 18px;
  font-weight: bold;
  line-height: 22px;
`;

const SubTitle = styled(TextSub)`
  font-size: 14px;
  line-height: 18px;
  margin-top: 4px;
  margin-left: 2px;
`;
