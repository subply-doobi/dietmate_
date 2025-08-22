// RN, expo
import React, { useState } from "react";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";

// doobi
import { version as appVersion } from "@/package.json";
import { useGetLatestVersion } from "@/shared/api/queries/version";
import { getNotShowAgainList } from "@/shared/utils/asyncStorage";
import {
  setInsets,
  setTutorialStart,
} from "@/features/reduxSlices/commonSlice";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { validateToken } from "@/shared/api/queries/token";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { checkIsUpdateNeeded } from "@/shared/utils/versionCheck";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { navigateByUserInfo } from "@/shared/utils/screens/login/navigateByUserInfo";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Platform, View } from "react-native";
import colors from "@/shared/colors";
import styled from "styled-components/native";
import { TextMain } from "@/shared/ui/styledComps";

const loadSplash = new Promise((resolve) =>
  setTimeout(() => {
    return resolve("loaded");
  }, 2000)
);

const AppLoading = () => {
  // eas update
  const { isDownloading, isChecking } = Updates.useUpdates();

  // router
  const router = useRouter();
  const statusBarHeight = useSafeAreaInsets().top;

  // useState
  const [showEasUpdateIndicator, setShowEasUpdateIndicator] = useState(false);

  // redux
  const dispatch = useAppDispatch();

  // react-query
  const { refetch: refetchBaseLine } = useGetBaseLine({ enabled: false });
  const { data: latestAppVersion, refetch: refetchLatestVersion } =
    useGetLatestVersion({ enabled: false });

  // useEffect 앱 로딩
  // 1. 스플래시 노출 2.앱 버전 확인 3. 자동로그인 4. 튜토리얼 모드 확인 5. 스플래시 숨김
  useEffect(() => {
    // 앱 업데이트 확인 (eas submit -> 스토어 연결)
    const checkIsUpToDate = async () => {
      const latestVersion = (await refetchLatestVersion()).data;

      if (!latestVersion) return false;

      const { isUpdateNeeded, message } = checkIsUpdateNeeded({
        appVersion: appVersion,
        latestVersion: latestVersion,
      });
      // console.log("ENV: ", ENV.BASE_URL, ENV.API_SECRET_IAMPORT);
      // console.log("appVersion:", appVersion, "latestVersion:", latestVersion);
      // console.log("message:", message);

      if (!isUpdateNeeded) return true;
      dispatch(openModal({ name: "appUpdateAlert" }));
      return false;
    };
    // 앱 업데이트 확인 (eas update -> 앱 업데이트 후 자동 재시작)
    const checkEasUpdate = async () => {
      // expo update
      try {
        const update = await Updates.checkForUpdateAsync();
        return update.isAvailable;
      } catch (error) {
        // You can also add an alert() to see the error message in case of an error when fetching updates.
        console.log("eas update check failed:", error);
        return false;
      }
    };

    // 토근 유효하다면 자동로그인
    const autoLogin = async (isAppUpToDate: boolean) => {
      const { isValidated } = await validateToken();
      if (!isValidated) return;
      const baseLineData = await refetchBaseLine().then((res) => res.data);
      baseLineData && isAppUpToDate && navigateByUserInfo(baseLineData, router);
    };

    const init = async () => {
      await loadSplash;

      // 앱 업데이트 확인
      const isUpToDate = await checkIsUpToDate();
      const isEasUpdateAvailable = await checkEasUpdate();
      // eas update 필요하면 자동 재시작
      if (isEasUpdateAvailable) {
        await SplashScreen.hideAsync();
        setShowEasUpdateIndicator(true);
        try {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
          return;
        } catch (error) {
          console.log("eas update check failed:", error);
        }
      }

      // 자동로그인 (토큰 유효성 검사 및 )
      await autoLogin(isUpToDate);

      // 튜토리얼 모드 확인
      const isTutorialMode = !(await getNotShowAgainList()).tutorial;
      // const isTutorialMode = false;
      isTutorialMode && dispatch(setTutorialStart());

      // hide splash
      await SplashScreen.hideAsync();
    };

    init();
    // init().finally(async () => {
    //   SplashScreen.hideAsync();
    // });
  }, []);

  // insets 설정
  useEffect(() => {
    const insetTop = Platform.OS === "ios" ? 0 : statusBarHeight;
    if (insetTop === 0) return;
    dispatch(setInsets({ insetTop }));
  }, [statusBarHeight]);

  return showEasUpdateIndicator ? (
    <Container>
      <LoadingText>앱 업데이트 중...</LoadingText>
      <ActivityIndicator size="small" color={colors.main} />
    </Container>
  ) : (
    <></>
  );
};

export default AppLoading;

const Container = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.white};
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
`;
