import { runErrAlertActionByCode } from "../../../shared/utils/handleError";
import DAlert from "../../../shared/ui/DAlert";
import styled from "styled-components/native";
import { Col, TextMain } from "../../../shared/ui/styledComps";
import { closeModal } from "../../../features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const RequestAlertContent = () => {
  const requestErrorAlert = useAppSelector(
    (state) => state.modal.modal.requestErrorAlert
  );
  const msg = requestErrorAlert?.values?.msg || "";
  return (
    <Container>
      <Col style={{ marginTop: 28, alignItems: "center" }}>
        <AlertText>{msg}</AlertText>
      </Col>
    </Container>
  );
};

const ErrorAlert = () => {
  // redux
  const dispatch = useAppDispatch();
  const requestErrorAlert = useAppSelector(
    (state) => state.modal.modal.requestErrorAlert
  );
  const errorCode = requestErrorAlert?.values?.code;

  const onConfirm = () => {
    runErrAlertActionByCode(errorCode);
    dispatch(closeModal({ name: "requestErrorAlert" }));
  };

  return (
    <>
      <DAlert
        alertShow={requestErrorAlert?.isOpen}
        onConfirm={onConfirm}
        onCancel={() => dispatch(closeModal({ name: "requestErrorAlert" }))}
        NoOfBtn={1}
        renderContent={() => <RequestAlertContent />}
      />
    </>
  );
};

export default ErrorAlert;

const Container = styled.View`
  padding: 0px 16px 24px 16px;
`;

const AlertText = styled(TextMain)`
  font-size: 16px;
  text-align: center;
`;
