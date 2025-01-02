// RN
import { Platform, ScrollView } from "react-native";

// 3rd
import styled from "styled-components/native";
import { useHeaderHeight } from "@react-navigation/elements";

// doobi
import colors from "@/shared/colors";
import { Container } from "@/shared/ui/styledComps";
import ListBtns from "@/shared/ui/ListBtns";
import { link } from "@/shared/utils/linking";
import { DEFAULT_BOTTOM_TAB_HEIGHT, INQUIRY_URL } from "@/shared/constants";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { icons } from "@/shared/iconSource";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const Mypage = () => {
  // navigation
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();

  // etc
  // btns
  const myPageBtns = [
    {
      title: "이용방법",
      btnId: "Tutorial",
      onPress: () => dispatch(openModal({ name: "tutorialRestartAlert" })),
      iconSource: icons.question_mypage_24,
    },
    {
      title: "목표변경",
      btnId: "TargeChange",
      onPress: () => router.push({ pathname: "/UserInput" }),
      iconSource: icons.target_mypage_24,
    },
    {
      title: "추천코드",
      btnId: "recommendCode",
      onPress: () => router.push({ pathname: "/RecommendCode" }),
      iconSource: icons.code_mypage_24,
    },
    {
      title: "찜한상품",
      btnId: "Likes",
      onPress: () => router.push({ pathname: "/Likes" }),
      iconSource: icons.heart_myPage_24,
    },
    {
      title: "주문내역",
      btnId: "OrderHistory",
      onPress: () => router.push({ pathname: "/OrderHistory" }),
      iconSource: icons.card_mypage_24,
    },
    {
      title: "공지사항",
      btnId: "Notice",
      onPress: () => router.push({ pathname: "/Notice" }),
      iconSource: icons.notice_mypage_24,
    },
    {
      title: "계정설정",
      btnId: "Account",
      onPress: () => router.push({ pathname: "/Account" }),
      iconSource: icons.account_mypage_24,
    },
    {
      title: "문의하기",
      btnId: "Inquiry",
      onPress: () => link(INQUIRY_URL),
      iconSource: icons.chat_mypage_24,
    },
  ];

  return (
    <Container
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
    </Container>
  );
};

export default Mypage;

const Card = styled.View`
  width: 100%;
  background-color: ${colors.white};
  padding: 64px 16px 16px 16px;
`;
