// RN, expo
import "expo-dev-client";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";

// 3rd
import "react-native-reanimated";
import styled from "styled-components/native";
import { Provider } from "react-redux";
import { store } from "@/shared/store/reduxStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/store/reactQueryStore";
import { initializeKakaoSDK } from "@react-native-kakao/core";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

// doobi
import colors from "@/shared/colors";
import BackArrow from "@/shared/ui/BackArrow";
import { link } from "@/shared/utils/linking";
import { INQUIRY_URL } from "@/shared/constants";
import { BtnSmall, BtnSmallText } from "@/shared/ui/styledComps";
import AppLoading from "@/components/appLoading/AppLoading";
import ModalComponent from "@/components/modal/ModalComponent";
import { setAutoAddFood } from "@/features/reduxSlices/formulaSlice";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import GlobalBSM from "@/components/bottomSheet/GlobalBSM";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Kakao SDK 초기화
initializeKakaoSDK("5065665acbfa07f0dd876a374e66e618");
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // navigation
  const router = useRouter();

  // const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  // });

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            {/* <SafeAreaView style={{ flex: 1 }}> */}
            <StatusBar style="dark" backgroundColor={colors.white} />

            {/* Loading */}
            <AppLoading />

            {/* Screens */}
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
              <Stack.Screen name="ResetToRoot" />
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
              {/* Formula More */}
              <Stack.Screen
                name="FormulaMore"
                options={{
                  headerShown: true,
                  headerTitle: "",
                }}
              />
              {/* AutoMenu settings */}
              <Stack.Screen
                name="AmSettings"
                options={{
                  headerShown: true,
                  headerTitle: "자동공식 설정",
                }}
              />

              {/* 식품 하나씩 추가 */}
              <Stack.Screen
                name="AutoAdd"
                options={{
                  headerShown: true,
                  headerTitle: "",
                  headerLeft: () => (
                    <BackArrow
                      goBackFn={() => {
                        store.dispatch(
                          setAutoAddFood({
                            foodForAdd: undefined,
                            foodForChange: undefined,
                          })
                        );
                        router.back();
                      }}
                    />
                  ),
                }}
              />

              <Stack.Screen
                name="Mypage"
                options={{
                  headerShown: true,
                  headerTitle: "마이페이지",
                  headerTitleAlign: "left",
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.textMain,
                  },
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

              {/* 주문정보 */}
              <Stack.Screen
                name="OrderHistory"
                options={{
                  headerShown: true,
                  headerTitle: "구매내역",
                  headerLeft: () => <BackArrow />,
                }}
              />
              <Stack.Screen
                name="OrderHistoryDetail"
                options={{
                  headerShown: true,
                  headerRight: () => (
                    <InquireBtn onPressIn={() => link(INQUIRY_URL)}>
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

            {/* Modal */}
            <ModalComponent />

            {/* </ThemeProvider> */}
            {/* <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        > */}
            <Toast />

            {/* bottomSheet */}
            <GlobalBSM />
            {/* </SafeAreaView> */}
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
const InquireBtn = styled(BtnSmall)`
  align-self: flex-end;
  width: "auto";
  padding: 0 16px;
`;
