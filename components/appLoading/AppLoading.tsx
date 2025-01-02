// RN, expo
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

// doobi
import { version as appVersion } from "@/package.json";
import { useGetLatestVersion } from "@/shared/api/queries/version";
import { getNotShowAgainList } from "@/shared/utils/asyncStorage";
import {
  setAppLoadingComplete,
  setTutorialStart,
} from "@/features/reduxSlices/commonSlice";
import { APP_STORE_URL, IS_ANDROID, PLAY_STORE_URL } from "@/shared/constants";
import { link } from "@/shared/utils/linking";
import DAlert from "@/shared/ui/DAlert";
import CommonAlertContent from "../modal/alert/CommonAlertContent";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { validateToken } from "@/shared/api/queries/token";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useNavigation } from "@react-navigation/native";
import { checkIsUpdateNeeded } from "@/shared/utils/versionCheck";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { navigateByUserInfo } from "@/shared/utils/screens/login/navigateByUserInfo";
import { useRouter } from "expo-router";
import React from "react";

const loadSplash = new Promise((resolve) =>
  setTimeout(() => {
    return resolve("loaded");
  }, 2000)
);

const AppLoading = () => {
  // router
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();

  // react-query
  const { refetch: refetchBaseLine } = useGetBaseLine({ enabled: false });
  const { data: latestAppVersion, refetch: refetchLatestVersion } =
    useGetLatestVersion({ enabled: false });

  // useEffect 앱 로딩
  // 1. 스플래시 노출 2.앱 버전 확인 3. 자동로그인 4. 튜토리얼 모드 확인 5. 스플래시 숨김
  useEffect(() => {
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
      dispatch(setAppLoadingComplete());
      SplashScreen.hideAsync();
    });
  }, []);

  return <></>;
};

export default AppLoading;
