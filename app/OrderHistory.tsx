// RN, expo
import { ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";

// 3rd

// doobi
import { useListOrder } from "@/shared/api/queries/order";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { closeModal } from "@/features/reduxSlices/modalSlice";

import { Container } from "@/shared/ui/styledComps";
import DAlert from "@/shared/ui/DAlert";
import CommonAlertContent from "@/components/common/alert/CommonAlertContent";
import OrderList from "@/components/screens/orderHistory/OrderList";

const OrderHistory = () => {
  // redux
  const dispatch = useAppDispatch();
  const orderEmptyAlert = useAppSelector(
    (state) => state.modal.modal.orderEmptyAlert
  );

  // navigation
  const router = useRouter();

  const { isLoading } = useListOrder();

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <OrderList />
      </ScrollView>

      {/* 주문내역 없을 때 알럿 */}
      <DAlert
        alertShow={orderEmptyAlert.isOpen}
        NoOfBtn={1}
        onConfirm={() => {
          dispatch(closeModal({ name: "orderEmptyAlert" }));
          router.back();
        }}
        onCancel={() => {
          dispatch(closeModal({ name: "orderEmptyAlert" }));
          router.back();
        }}
        renderContent={() => (
          <CommonAlertContent text="아직 주문내역이 없어요" />
        )}
      />
    </Container>
  );
};

export default OrderHistory;
