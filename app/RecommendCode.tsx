import { ScreenContainer, HorizontalSpace } from "@/shared/ui/styledComps";
import ListBtns from "@/shared/ui/ListBtns";

import { useGetUser } from "@/shared/api/queries/user";

import { setValue } from "@/features/reduxSlices/userInputSlice";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import Card from "@/components/screens/recommendCode/Card";

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
    <ScreenContainer>
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
          iconName="checkCircle"
        />
      )}
      <HorizontalSpace height={64} />
      <ListBtns btns={btns} />
    </ScreenContainer>
  );
};

export default RecommendCode;
