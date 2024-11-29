import { Linking, Platform } from "react-native";

import { openModal } from "@/features/reduxSlices/modalSlice";

import SendIntentAndroid from "react-native-send-intent";
import { IntentUrlParser } from "@/shared/utils/intentParsing";
import { store } from "@/shared/store/reduxStore";

export const parseUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const queryString = url.split("?")[1];
  if (queryString) {
    const pairs = queryString.split("&");
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  }
  return params;
};

export const getPaymentResult = (url: string) => {
  const params = parseUrlParams(url);
  return {
    // iamport 자체 response params
    code: params.code,
    message: params.message,
    paymentId: params.paymentId,
    pgCode: params.pgCode,
    pgMessage: params.pgMessage,
    transactionType: params.transactionType,
    txId: params.txId,
    status: params.status,
    storeId: params.storeId,

    // 간혹 웹뷰 중간에서 우리 앱으로 돌아올 때 위 params말고 complete type이 있기도 함 (실패)
    completeType: params.completeType,
  };
};

export const openOtherApp = (url: string) => {
  // 초기페이지, 결제완료(성공 or 실패)인 경우는 제외
  if (
    url === "about:blank" ||
    url.startsWith("dietmate://payV2") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  )
    return;

  // 안드로이드 intent 처리
  if (Platform.OS === "android") {
    const { appLink } = new IntentUrlParser(url);
    console.log("appLink:", appLink);
    SendIntentAndroid.openAppWithUri(appLink)
      .then((isOpened) => {
        if (isOpened) return;
        console.log("Failed to open app with appLink:", appLink);
        SendIntentAndroid.openAppWithUri(url)
          .then((isOpened) => {
            if (isOpened) return;
            console.log("Failed to open app with url:", url);
          })
          .catch((err) => {
            store.dispatch(openModal({ name: "payUrlAlert" }));
          });
      })
      .catch((err) => {
        store.dispatch(openModal({ name: "payUrlAlert" }));
      });

    // ios 처리
  } else if (Platform.OS === "ios" && !url.startsWith("intent:")) {
    Linking.openURL(url).catch((err) => {
      console.log("ios openURL error: ", err);
      store.dispatch(openModal({ name: "payUrlAlert" }));
    });
  }
};
