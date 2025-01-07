import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { Col, TextMain } from "@/shared/ui/styledComps";
import styled from "styled-components/native";

export const RequestAlertContent = () => {
  const msg = useAppSelector(
    (state) => state.modal.values.requestErrorAlert.msg
  );
  return (
    <Container>
      <Col style={{ marginTop: 28, alignItems: "center" }}>
        <AlertText>{msg}</AlertText>
      </Col>
    </Container>
  );
};

export default RequestAlertContent;

const Container = styled.View`
  padding: 0px 16px 24px 16px;
`;

const AlertText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  text-align: center;
`;
