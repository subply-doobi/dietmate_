import styled from 'styled-components/native';

import {Col, TextMain} from '../../../shared/ui/styledComps';

const CommonAlertContent = ({
  text,
  subText,
}: {
  text: string;
  subText?: string;
}) => {
  return (
    <Container>
      <Col style={{marginTop: 28, alignItems: 'center'}}>
        <AlertText>{text}</AlertText>
        {subText && (
          <AlertText style={{fontSize: 12, marginTop: 16}}>{subText}</AlertText>
        )}
      </Col>
    </Container>
  );
};

export default CommonAlertContent;

const Container = styled.View`
  padding: 0px 16px 24px 16px;
`;

const AlertText = styled(TextMain)`
  font-size: 16px;
  text-align: center;
`;
