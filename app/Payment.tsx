// RN
import { createRef, useEffect } from "react";
import { BackHandler, Platform, SafeAreaView } from "react-native";

// 3rd
import {
  Payment as PortOnePayment,
  PortOneController,
} from "@portone/react-native-sdk";

// doobi
import { useUpdateDiet } from "@/shared/api/queries/diet";
import { useDeleteOrder, useUpdateOrder } from "@/shared/api/queries/order";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useLocalSearchParams, useRouter } from "expo-router";

import { IIamportPayParams } from "@/shared/utils/screens/order/setPayData";
import { PaymentRequest } from "@portone/browser-sdk/v2";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";

const Payment = () => {
  // redux
  const dispatch = useAppDispatch();

  const router = useRouter();
  const {
    payParams_iamport: payParams_iamportJString,
    orderNo,
  }: {
    payParams_iamport: string;
    orderNo: string;
  } = useLocalSearchParams();
  const payParams_iamport: IIamportPayParams =
    payParams_iamportJString && JSON.parse(payParams_iamportJString);

  // react-query
  const updateDietMutation = useUpdateDiet();
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();

  // etc
  const controller = createRef<PortOneController>();

  // useEffect
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (controller.current?.canGoBack) {
          controller.current.webview?.goBack();
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  });

  // handle paymentResult
  const onPaymentSuccess = async () => {
    router.canDismiss() && router.dismissAll();
    router.replace({ pathname: "/OrderComplete" });
    dispatch(setCurrentFMCIdx(0));
    await updateDietMutation.mutateAsync({
      statusCd: "SP006005",
      orderNo,
    });
    await updateOrderMutation.mutateAsync({
      orderNo,
      statusCd: "SP006005",
    });
  };
  const onPaymentFail = async (msg: string) => {
    await updateDietMutation.mutateAsync({
      statusCd: "SP006001",
      orderNo,
    });
    await deleteOrderMutation.mutateAsync({ orderNo: orderNo });
    dispatch(openModal({ name: "payFailAlert", values: { payFailMsg: msg } }));
    router.back();
  };

  const statusBarHeight = useSafeAreaInsets().top;
  const insetTop = Platform.OS === "ios" ? 0 : statusBarHeight;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insetTop }}>
      <PortOnePayment
        ref={controller}
        request={payParams_iamport as PaymentRequest}
        onError={(error) => onPaymentFail(error.message)}
        onComplete={(complete) => onPaymentSuccess()}
      />
    </SafeAreaView>
  );
};

export default Payment;
