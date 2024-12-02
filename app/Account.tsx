// RN, expo

// 3rd
import styled from "styled-components/native";

// doobi
import {
  initializeNotShowAgainList,
  removeToken,
} from "@/shared/utils/asyncStorage";
import { useDeleteUser } from "@/shared/api/queries/user";
import colors from "@/shared/colors";
import { initializeInput } from "@/features/reduxSlices/userInputSlice";
import { queryClient } from "@/shared/store/reactQueryStore";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";

import { TextMain, Col } from "@/shared/ui/styledComps";
import DAlert from "@/shared/ui/DAlert";
import ListBtns from "@/shared/ui/ListBtns";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useNavigation, useRouter } from "expo-router";

const WithdrawalContent = ({ deleteText }: { deleteText: string }) => {
  return (
    <WithdrawalContainer>
      <Col style={{ marginTop: 28, alignItems: "center" }}>
        <AlertText>{deleteText}</AlertText>
      </Col>
    </WithdrawalContainer>
  );
};

const Account = () => {
  // redux
  const dispatch = useAppDispatch();
  const accountWDAlert = useAppSelector(
    (state) => state.modal.modal.accountWithdrawalAlert
  );

  // navigation
  const router = useRouter();
  const navigation = useNavigation();
  const deleteUser = useDeleteUser();

  // etc

  // logout Fn
  const onLogout = async () => {
    try {
      await removeToken();
      navigation.reset({
        index: 0,
        routes: [{ name: "index" }],
      });
    } catch (e) {
      console.log(e);
    }
  };
  //회원탈퇴 Fn
  const onWithdrawal = async () => {
    try {
      dispatch(closeModal({ name: "accountWithdrawalAlert" }));
      deleteUser.mutate();
      queryClient.clear();
      await initializeNotShowAgainList();
      dispatch(initializeInput());
      await removeToken();
    } catch (e) {
      console.log(e);
    }
  };

  // btns
  const accountBtns = [
    {
      title: "로그아웃",
      btnId: "logout",
      onPress: () => onLogout(),
    },
    {
      title: "계정삭제",
      btnId: "withdrawal",
      onPress: () => dispatch(openModal({ name: "accountWithdrawalAlert" })),
    },
  ];

  //회원탈퇴 alert
  const WithdrawalAlert = () => {
    return (
      <DAlert
        alertShow={accountWDAlert.isOpen}
        renderContent={() => (
          <WithdrawalContent deleteText={"계정을 삭제합니다"} />
        )}
        onConfirm={() => onWithdrawal()}
        onCancel={() =>
          dispatch(closeModal({ name: "accountWithdrawalAlert" }))
        }
        confirmLabel={"삭제"}
        NoOfBtn={2}
      />
    );
  };

  return (
    <Container>
      <ListBtns btns={accountBtns} />
      <WithdrawalAlert />
    </Container>
  );
};

export default Account;

const Container = styled.View`
  flex: 1;
  padding: 0px 16px 0px 16px;
  background-color: ${colors.white};
`;
const WithdrawalContainer = styled.View`
  padding: 0px 16px 24px 16px;
`;

const AlertText = styled(TextMain)`
  font-size: 16px;
`;
