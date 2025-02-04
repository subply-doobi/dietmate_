// 3rd
import RNRestart from "react-native-restart";
import NetInfo from "@react-native-community/netinfo";

// doobi util
import { store } from "@/shared/store/reduxStore";
import { isAxiosError } from "axios";
// import {navigationRef} from '../../app/navigators/navigationRef';
import { queryClient } from "@/shared/store/reactQueryStore";
import { setTutorialStart } from "../../features/reduxSlices/commonSlice";

import { openModal } from "../../features/reduxSlices/modalSlice";
import { router } from "expo-router";
import { ENV } from "../constants";

// 에러 -> 에러코드
// null -> 네트워크 없음
// 네트워크 연결 있는데 Network Error인 경우 -> 999 (지금은 서버 주소 바뀌었을 때 발생)
const convertErrorToCode = async (error: unknown) => {
  if (!error) return undefined;
  if (!isAxiosError(error)) return 520;
  if (
    error.message === "Network Error" ||
    error.message === `timeout of ${ENV.AXIOS_TIMEOUT}ms exceeded`
  ) {
    const isOnline = (await NetInfo.fetch()).isConnected;
    return isOnline ? 999 : null;
  }
  if (error.response) return error.response.status;
  return 520;
};

// 에러 코드별 메시지
type IErrorCode = number;
type ICodeToMsg = {
  [key: number]: string;
};
export const msgByCode: ICodeToMsg = {
  401: `다시 로그인을 해주세요\n\n(errorCode: 401)`,
  500: `서버 오류가 발생했어요\n앱을 재시작합니다\n\n(errorCode: 500)`,
  999: "서버 점점중입니다\n빠른 시일 내에 해결할게요",
};
const getMsgByCode = (code: IErrorCode | undefined | null) => {
  if (code === undefined) return "";
  if (code === null) return `네트워크가 불안정해요\n연결을 확인해주세요`;
  return (
    msgByCode[code] ||
    `알수없는 오류가 발생했어요\n오류가 계속되면 문의바랍니다\n\n(errorCode: ${code})`
  );
};

// 에러 코드별 실행 로직
type ICodeToErrorAction = {
  [key: number]: Function | null;
};
const errorActionByCode: ICodeToErrorAction = {
  999: () => {
    // 네트워크 연결은 있는데 우리 서버 문제 있는 경우
    router.canDismiss() && router.dismissAll();
    router.replace({
      pathname: "/ErrorPage",
      params: { errorCode: "999", msg: getMsgByCode(999) },
    });
  },
  // TBD
};

// 에러코드 -> 액션
const runErrorActionByCode = (code: IErrorCode | undefined | null) => {
  console.log("runErrorActionByCode: ", code);
  // undefined -> nothing
  if (code === undefined) return;

  // 네트워크 연결 없음
  if (code === null) {
    router.canDismiss() && router.dismissAll();
    router.replace({
      pathname: "/ErrorPage",
      params: { errorCode: String(code), msg: getMsgByCode(code) },
    });
    return;
  }

  // 정의된 것 있는 경우
  if (errorActionByCode[code]) {
    errorActionByCode[code]();
    return;
  }
  // 정의된 것 없는 경우 ErrorAlert 띄우기
  store.dispatch(
    openModal({
      name: "requestErrorAlert",
      values: { code: code, msg: getMsgByCode(code) },
    })
  );
};

// ErrorAlert 띄우는 경우 확인버튼 눌렀을 때 실행할 함수
const commonAlertAction = () => {
  queryClient.invalidateQueries();
};

const ErrAlertActionByCode: ICodeToErrorAction = {
  500: () => {
    store.getState().common.isTutorialMode &&
      store.dispatch(setTutorialStart());
    RNRestart.Restart();
  },
  401: () => {
    // 튜토리얼모드초기화 + 로그인화면이동 + queryCache clean
    store.getState().common.isTutorialMode &&
      store.dispatch(setTutorialStart());
    router.canDismiss() && router.dismissAll();
    router.replace({ pathname: "/ResetToRoot" });
    queryClient.clear();
  },
};

export const runErrAlertActionByCode = (
  code: IErrorCode | undefined | null
) => {
  if (!code) return;
  if (ErrAlertActionByCode[code]) {
    ErrAlertActionByCode[code]();
    return;
  }
  commonAlertAction();
};

// 에러 핸들러
export const handleError = async (error: Error) => {
  console.log("handleError: ", error);
  const errorCode = await convertErrorToCode(error);
  console.log("errorCode: ", errorCode, typeof errorCode);
  runErrorActionByCode(errorCode);
};
