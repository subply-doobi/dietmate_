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

  // navigation
  const router = useRouter();

  // react-query
  const { data: userData } = useGetUser();

  const isSuggestUserExist = Boolean(userData?.suggestFromCd);

  // etc
  const btns = [
    {
      title: isSuggestUserExist
        ? "근의 공식을 추천해준 친구코드 변경"
        : "근의 공식을 추천해준 친구코드 등록",
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
    </Container>
  );
};

export default RecommendCode;
