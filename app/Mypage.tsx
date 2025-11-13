// RN
import { Platform, ScrollView } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import colors from "@/shared/colors";
import { ScreenContainer } from "@/shared/ui/styledComps";
import ListBtns from "@/shared/ui/ListBtns";
import { link } from "@/shared/utils/linking";
import { DEFAULT_BOTTOM_TAB_HEIGHT, INQUIRY_URL } from "@/shared/constants";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";

const Mypage = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();

  const myPageBtns = [
    {
      title: "이용방법",
      btnId: "Tutorial",
      onPress: () => dispatch(openModal({ name: "tutorialRestartAlert" })),
      iconName: "questionCircle_mp",
      iconSize: 16,
    },
    {
      title: "목표변경",
      btnId: "TargeChange",
      onPress: () => router.push({ pathname: "/UserInput" }),
      iconName: "target_mp",
      iconSize: 20,
    },
    {
      title: "추천코드",
      btnId: "recommendCode",
      onPress: () => router.push({ pathname: "/RecommendCode" }),
      iconName: "code_mp",
      iconSize: 18,
    },
    {
      title: "주문내역",
      btnId: "OrderHistory",
      onPress: () => router.push({ pathname: "/OrderHistory" }),
      iconName: "card_mp",
      iconSize: 20,
    },
    {
      title: "공지사항",
      btnId: "Notice",
      onPress: () => router.push({ pathname: "/Notice" }),
      iconName: "notice_mp",
      iconSize: 20,
    },
    {
      title: "계정설정",
      btnId: "Account",
      onPress: () => router.push({ pathname: "/Account" }),
      iconName: "account_mp",
      iconSize: 20,
    },
    {
      title: "문의하기",
      btnId: "Inquiry",
      onPress: () => link(INQUIRY_URL),
      iconName: "chat_mp",
      iconSize: 18,
    },
  ];
  return (
    <ScreenContainer
      style={{
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: Platform.OS === "ios" ? DEFAULT_BOTTOM_TAB_HEIGHT : 0,
        backgroundColor: colors.white,
      }}
    >
      {/* 메뉴 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <ListBtns btns={myPageBtns} />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

export default Mypage;

const Card = styled.View`
  width: 100%;
  background-color: ${colors.white};
  padding: 64px 16px 16px 16px;
`;
