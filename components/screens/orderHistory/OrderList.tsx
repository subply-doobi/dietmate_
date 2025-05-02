// RN
import { useEffect } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { SCREENWIDTH } from "@/shared/constants";
import colors from "@/shared/colors";
import { commaToNum } from "@/shared/utils/sumUp";
import { useListOrder } from "@/shared/api/queries/order";
import { regroupByBuyDateAndDietNo } from "@/shared/utils/dataTransform";
import { closeModal, openModal } from "@/features/reduxSlices/modalSlice";
import OrderedMenu from "./OrderedMenu";
import {
  Col,
  Row,
  HorizontalLine,
  TextSub,
  TextMain,
} from "@/shared/ui/styledComps";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const OrderList = () => {
  // redux
  const dispatch = useAppDispatch();
  const modalSeq = useAppSelector((state) => state.modal.modalSeq);
  const { data: orderData } = useListOrder();

  // navigation
  const router = useRouter();

  // 구매날짜, dietNo로 식단 묶기
  const regroupedData = regroupByBuyDateAndDietNo(orderData);

  // useEffect
  // 주문정보 비어있는지 확인
  useEffect(() => {
    if (!orderData) return;
    if (orderData.length === 0) {
      dispatch(openModal({ name: "orderEmptyAlert" }));
      return;
    }
    modalSeq.includes("orderEmptyAlert") &&
      orderData.length > 0 &&
      dispatch(closeModal({ name: "orderEmptyAlert" }));
  }, [orderData]);

  return (
    // 주문날짜 별로 반복
    <Col style={{ rowGap: 64, marginTop: 24 }}>
      {regroupedData?.map((order, orderIdx) => (
        <OrderBox key={orderIdx}>
          <Row
            style={{
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            <OrderDate>{order[0][0].buyDate}</OrderDate>
            <DetailBtn
              onPress={() =>
                router.push({
                  pathname: "/OrderHistoryDetail",
                  params: {
                    orderDetailData: JSON.stringify(order),
                    totalPrice: order[0][0].orderPrice,
                  },
                })
              }
            >
              <DetailBtnText>상세보기</DetailBtnText>
            </DetailBtn>
          </Row>
          <HorizontalLine
            width={SCREENWIDTH - 32}
            style={{ alignSelf: "center" }}
          />

          {/* 해당 주문에 구매한 끼니들 */}
          <OrderedMenu order={order} />

          {/* 해당 주문 금액 */}
          <TotalPrice>{commaToNum(order[0][0].orderPrice)} 원</TotalPrice>
        </OrderBox>
      ))}
    </Col>
  );
};

export default OrderList;

const OrderBox = styled.View``;

const OrderDate = styled(TextSub)`
  font-size: 12px;
`;
const DetailBtn = styled.TouchableOpacity`
  width: 64px;
  height: 24px;
  border-radius: 5px;
  border-width: 1px;
  border-color: ${colors.lineLight};
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  margin-left: 8px;
`;

const DetailBtnText = styled(TextMain)`
  font-size: 14px;
`;

const TotalPrice = styled(TextMain)`
  margin-top: 16px;
  margin-right: 16px;
  font-size: 16px;
  font-weight: bold;
  align-self: flex-end;
`;
