import "expo-dev-client";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { getHeaderTitle } from "@react-navigation/elements";

import { useColorScheme } from "@/hooks/useColorScheme";
import colors from "@/shared/colors";
import BackArrow from "@/shared/ui/BackArrow";
import { link } from "@/shared/utils/linking";
import { INQUIRY_URL } from "@/shared/constants";
import styled from "styled-components/native";
import { BtnSmall, BtnSmallText } from "@/shared/ui/styledComps";
import { Provider } from "react-redux";
import { store } from "@/shared/store/reduxStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/store/reactQueryStore";
import { initializeKakaoSDK } from "@react-native-kakao/core";
import AppLoading from "@/components/appLoading/AppLoading";
import { SafeAreaView } from "react-native";

// Kakao SDK 초기화
initializeKakaoSDK("5065665acbfa07f0dd876a374e66e618");
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // navigation
  const router = useRouter();

  const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  // });

  return (
    // redux
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        > */}
        <SafeAreaView style={{ flex: 1 }}>
          <AppLoading />
          <Stack
            screenOptions={{
              headerShown: false,
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: "bold",
                color: colors.textMain,
              },
              headerShadowVisible: false,
              headerBackVisible: false,
              headerLeft: () => <BackArrow goBackFn={router.back} />,
            }}
          >
            {/* 로그인 */}
            <Stack.Screen name="index" />

            {/* 정보입력 */}
            <Stack.Screen
              name="UserInput"
              options={{
                headerShown: true,
                headerTitle: "",
              }}
            />

            {/* 홈 - 마이페이지 - 좋아요 - 장바구니 */}
            <Stack.Screen name="(tabs)" />

            {/* 자동구성 가이드 */}
            <Stack.Screen
              name="AutoMenu"
              options={{ headerShown: true, headerTitle: "" }}
            />

            <Stack.Screen
              name="ManualAdd"
              options={{ headerShown: true, headerTitle: "식품선택" }}
            />

            <Stack.Screen
              name="Change"
              options={{ headerShown: true, headerTitle: "식품변경" }}
            />

            {/* 좋아요 식품 */}
            <Stack.Screen
              name="Likes"
              options={{
                headerShown: true,
                headerTitle: "찜한 상품",
              }}
            />

            {/* 식품상세 */}
            <Stack.Screen
              name="FoodDetail"
              options={{
                headerShown: true,
                headerTitle: "",
              }}
            />

            {/* 주문 */}
            <Stack.Screen
              name="Order"
              options={{
                headerShown: true,
                headerTitle: "주문 / 결제",
              }}
            />

            {/* 배송지 수정 */}
            <Stack.Screen
              name="AddressEdit"
              options={{
                headerShown: true,
                headerTitle: "배송지",
              }}
            />

            {/* 결제페이지 */}
            <Stack.Screen name="Payment" />

            {/* history는 추후 추가 */}
            {/* <Stack.Screen name="HistoryNav" component={HistoryNav} /> */}

            {/* 주문정보 */}
            <Stack.Screen
              name="OrderHistory"
              options={{
                headerShown: true,
                headerTitle: "구매내역",
              }}
            />
            <Stack.Screen
              name="OrderHistoryDetail"
              options={{
                headerShown: true,
                headerRight: () => (
                  <InquireBtn onPress={() => link(INQUIRY_URL)}>
                    <BtnSmallText>문의</BtnSmallText>
                  </InquireBtn>
                ),
              }}
            />

            {/* 주문완료 */}
            <Stack.Screen name="OrderComplete" />

            {/* 계정 설정 */}
            <Stack.Screen
              name="Account"
              options={{
                headerShown: true,
                headerTitle: "계정 설정",
              }}
            />

            {/* 공지사항 */}
            <Stack.Screen
              name="Notice"
              options={{
                headerShown: true,
                headerTitle: "공지사항",
              }}
            />

            {/* 추천코드 */}
            <Stack.Screen
              name="RecommendCode"
              options={{
                headerShown: true,
                headerTitle: "추천코드",
              }}
            />

            {/* 내 보너스 현황 */}
            <Stack.Screen
              name="MyBonus"
              options={{
                headerShown: true,
                headerTitle: "내 보너스 현황",
              }}
            />

            {/* 체크리스트 */}
            <Stack.Screen
              name="Checklist"
              options={{
                headerShown: true,
                headerTitle: "",
              }}
            />

            {/* 에러페이지 */}
            <Stack.Screen name="ErrorPage" />

            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
        {/* </ThemeProvider> */}
      </QueryClientProvider>
    </Provider>
  );
}
const InquireBtn = styled(BtnSmall)`
  align-self: flex-end;
  width: "auto";
  padding: 0 16px;
`;
