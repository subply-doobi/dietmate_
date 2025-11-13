// RN, expo
import { ActivityIndicator, ScrollView } from "react-native";

// 3rd

// doobi
import { useListOrder } from "@/shared/api/queries/order";

import { ScreenContainer } from "@/shared/ui/styledComps";
import OrderList from "@/components/screens/orderHistory/OrderList";

const OrderHistory = () => {
  const { isLoading } = useListOrder();

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <ScreenContainer style={{ paddingLeft: 0, paddingRight: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <OrderList />
      </ScrollView>
    </ScreenContainer>
  );
};

export default OrderHistory;
