import styled from 'styled-components/native';

import {Col, TextMain} from '../../../shared/ui/styledComps';

const CreateLimitAlertContent = () => {
  return (
    <Container>
      <Col style={{marginTop: 28, alignItems: 'center'}}>
        <AlertText>끼니는 5개 까지만 추가가 가능해요</AlertText>
      </Col>
    </Container>
  );
};

export default CreateLimitAlertContent;

const Container = styled.View`
  padding: 0px 16px 24px 16px;
`;

const AlertText = styled(TextMain)`
  font-size: 16px;
  text-align: center;
`;
