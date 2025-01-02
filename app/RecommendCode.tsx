import { Container, HorizontalSpace } from "@/shared/ui/styledComps";
import ListBtns from "@/shared/ui/ListBtns";

import { useGetUser } from "@/shared/api/queries/user";
import {
  useCreateSuggestUser,
  useGetSuggestUser,
  useGetSuggestUserExistYn,
  useUpdateSuggestUser,
} from "@/shared/api/queries/suggest";
import { useState } from "react";
import DAlert from "@/shared/ui/DAlert";

import { setValue } from "@/features/reduxSlices/userInputSlice";
import { icons } from "@/shared/iconSource";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import Card from "@/components/screens/recommendCode/Card";
import CodeAlertContent from "@/components/screens/recommendCode/CodeAlertContent";

const RecommendCode = () => {
  // redux
  const dispatch = useAppDispatch();
  const friendCd = useAppSelector((state) => state.userInput.friendCd);

  // navigation
  const router = useRouter();

  // react-query
  const { data: userData } = useGetUser();

  const isSuggestUserExist = Boolean(userData?.suggestFromCd);
  const createSuggestUserMutation = useCreateSuggestUser();
  const updateSuggestUserMutation = useUpdateSuggestUser();

  // useState
  const [isCodeError, setIsCodeError] = useState(false);

  // etc
  const btns = [
    {
      title: isSuggestUserExist
        ? "추천해준 친구코드 변경"
        : "추천해준 친구코드 등록",
      btnId: "Edit",
      onPress: () => {
        dispatch(
          setValue({ name: "friendCd", value: userData?.suggestFromCd || "" })
        );
        dispatch(openModal({ name: "friendCdAlert" }));
      },
    },
    {
      title: "내 보너스 현황",
      btnId: "MyBonus",
      onPress: () => router.push({ pathname: "/MyBonus" }),
    },
  ];

  // fn
  const onCodeAlertConfirm = async () => {
    // TBD | 해당 사용자가 있는지는 아직 확인 안함
    if (friendCd.value === "") {
      setIsCodeError(true);
      return;
    }

    isSuggestUserExist
      ? await updateSuggestUserMutation.mutateAsync(friendCd.value)
      : await createSuggestUserMutation.mutateAsync(friendCd.value);

    dispatch(closeModal({ name: "friendCdAlert" }));
  };

  const onCodeAlertCancel = () => {
    dispatch(closeModal({ name: "friendCdAlert" }));
    setIsCodeError(false);
  };

  return (
    <Container>
      <Card
        label="내 코드"
        value={userData?.suggestCd}
        style={{ marginTop: 40 }}
      />
      {isSuggestUserExist && (
        <Card
          label="친구 코드 등록 완료"
          value={userData?.suggestFromCd}
          style={{ marginTop: 24, height: 48 }}
          icon={icons.checkRoundCheckedGreen_24}
        />
      )}
      <HorizontalSpace height={64} />
      <ListBtns btns={btns} />

      <DAlert
        alertShow={recommendCodeAlert.isOpen}
        onCancel={onCodeAlertCancel}
        onConfirm={onCodeAlertConfirm}
        renderContent={() => <CodeAlertContent isCodeError={isCodeError} />}
        NoOfBtn={2}
      />
    </Container>
  );
};

export default RecommendCode;
