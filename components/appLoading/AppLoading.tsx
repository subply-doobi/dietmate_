// RN, expo
import React from "react";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

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
import { Platform } from "react-native";

const loadSplash = new Promise((resolve) =>
  setTimeout(() => {
    return resolve("loaded");
  }, 2000)
);

const AppLoading = () => {
  // router
  const router = useRouter();
  const statusBarHeight = useSafeAreaInsets().top;

  // redux
  const dispatch = useAppDispatch();

  // react-query
  const { refetch: refetchBaseLine } = useGetBaseLine({ enabled: false });
  const { data: latestAppVersion, refetch: refetchLatestVersion } =
    useGetLatestVersion({ enabled: false });

  // useEffect 앱 로딩
  // 1. 스플래시 노출 2.앱 버전 확인 3. 자동로그인 4. 튜토리얼 모드 확인 5. 스플래시 숨김
  useEffect(() => {
    // 앱 업데이트 확인
    const checkIsUpToDate = async () => {
      const latestVersion = (await refetchLatestVersion()).data;
      if (!latestVersion) return false;

      const { isUpdateNeeded, message } = checkIsUpdateNeeded({
        appVersion: appVersion,
        latestVersion: latestVersion,
      });
      console.log("appVersion:", appVersion, "latestVersion:", latestVersion);
      console.log("message:", message);

      if (!isUpdateNeeded) return true;
      dispatch(openModal({ name: "appUpdateAlert" }));
      return false;
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

      // 자동로그인 (토큰 유효성 검사 및 )
      await autoLogin(isUpToDate);

      // 튜토리얼 모드 확인
      const isTutorialMode = !(await getNotShowAgainList()).tutorial;
      isTutorialMode && dispatch(setTutorialStart());
    };

    init().finally(async () => {
      SplashScreen.hideAsync();
    });
  }, []);

  // insets 설정
  useEffect(() => {
    const insetTop = Platform.OS === "ios" ? 0 : statusBarHeight;
    if (insetTop === 0) return;
    dispatch(setInsets({ insetTop }));
  }, [statusBarHeight]);

  return <></>;
};

export default AppLoading;
