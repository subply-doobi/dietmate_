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
import { closeModal, openModal } from "@/features/reduxSlices/modalSlice";
import { Container } from "@/shared/ui/styledComps";
import DAlert from "@/shared/ui/DAlert";
import CommonAlertContent from "@/components/common/alert/CommonAlertContent";
import { setCurrentDiet } from "@/features/reduxSlices/commonSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useLocalSearchParams, useRouter } from "expo-router";

import { IIamportPayParams } from "@/shared/utils/screens/order/setPayData";
import { PaymentRequest } from "@portone/browser-sdk/v2";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Payment = () => {
  // redux
  const dispatch = useAppDispatch();
  const payUrlAlert = useAppSelector((state) => state.modal.modal.payUrlAlert);

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
    dispatch(setCurrentDiet(""));
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

      <DAlert
        alertShow={payUrlAlert.isOpen}
        onCancel={() => dispatch(closeModal({ name: "payUrlAlert" }))}
        onConfirm={() => dispatch(closeModal({ name: "payUrlAlert" }))}
        renderContent={() => (
          <CommonAlertContent
            text={"앱이 설치되어있는지 확인해주세요"}
            subText="문제가 계속되면 문의 바랍니다"
          />
        )}
        NoOfBtn={1}
      />
    </SafeAreaView>
  );
};

export default Payment;
