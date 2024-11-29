import {ViewProps} from 'react-native';
import {TextMain, TextSub} from './styledComps';
import styled from 'styled-components/native';

interface IGuideTitle extends ViewProps {
  title: string;
  subTitle: string;
  titleAlign?: 'center' | 'left' | 'right';
}
const GuideTitle = ({
  title,
  subTitle,
  titleAlign = 'left',
  ...props
}: IGuideTitle) => {
  return (
    <Box {...props}>
      <Title titleAlign={titleAlign}>{title}</Title>
      <SubTitle titleAlign={titleAlign}>{subTitle}</SubTitle>
    </Box>
  );
};

export default GuideTitle;

const Box = styled.View`
  width: 100%;
  align-items: flex-start;
`;

const Title = styled(TextMain)<{titleAlign?: 'center' | 'left' | 'right'}>`
  width: 100%;
  font-size: 24px;
  line-height: 32px;
  font-weight: bold;
  text-align: ${({titleAlign}) => titleAlign};
`;

const SubTitle = styled(TextSub)<{titleAlign?: 'center' | 'left' | 'right'}>`
  width: 100%;
  font-size: 16px;
  line-height: 24px;
  margin-top: 16px;
  text-align: ${({titleAlign}) => titleAlign};
`;
