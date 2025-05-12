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
import ListBtns from "@/shared/ui/ListBtns";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useNavigation } from "expo-router";

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

  // navigation
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

  return (
    <Container>
      <ListBtns btns={accountBtns} />
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
  line-height: 20px;
`;
