import styled from "styled-components/native";
import { Col, TextMain, TextSub } from "@/shared/ui/styledComps";
import { getStatusContent } from "./status";
import { IOrderedProduct } from "@/shared/api/types/order";
import { reGroupOrderBySeller } from "@/shared/utils/dataTransform";
import colors from "@/shared/colors";
import { commaToNum, sumUpPrice } from "@/shared/utils/sumUp";
import DAccordionHeader from "@/shared/ui/DAccordionHeader";
import { Text } from "react-native";
import OrderedMenu from "@/components/screens/orderHistoryDetail/OrderedMenu";
import { MENU_NUM_LABEL } from "@/shared/constants";

export const getHistoryDetailAcContent = (
  orderDetailData: IOrderedProduct[][],
  totalPrice: string
) => {
  // etc
  // 판매자별 주문식품, 전체 배송비 합계
  const orderedProductAll = orderDetailData?.reduce((acc, cur) => {
    return acc.concat(cur);
  }, []);
  const regroupedOrderedData = reGroupOrderBySeller(orderedProductAll);
  const menuNum = orderDetailData.length;
  const foodNum = orderedProductAll.length;
  const totalShippingPrice = orderedProductAll[0].shippingPrice;

  // resultStatusCd: "SP013001" | "SP013002" | "SP013003" | "SP013004";
  // resultStatusNm: "확인중" | "재고없음" | "환불요청" | "처리완료";
  const resultStatusCd = "SP013001"; // TODO | 서버데이터로 대체할 것
  const { statusColor, statusText, statusSubTitle } =
    getStatusContent(resultStatusCd);

  return [
    // {
    //   title: '주문상태',
    //   subTitle: statusSubTitle,
    //   headerContent: (
    //     <StatusBox color={statusColor}>
    //       <StatusText>{statusText}</StatusText>
    //     </StatusBox>
    //   ),
    //   content: <></>,
    // },
    {
      title: "공식",
      subTitle: `${MENU_NUM_LABEL[menuNum - 1]} (식품${foodNum}개)`,
      headerContent: null,
      content: <OrderedMenu orderDetailData={orderDetailData} />,
    },
    {
      title: "배송지",
      subTitle: `${orderDetailData[0][0]?.buyerName} | ${orderDetailData[0][0]?.buyerTel} \n${orderDetailData[0][0]?.buyerAddr}`,
      headerContent: null,
      content: <></>,
    },
    {
      title: "결제수단",
      subTitle: `${orderDetailData[0][0]?.payMethod}`,
      headerContent: null,
      content: <></>,
    },
    {
      title: "결제금액",
      subTitle: null,
      headerContent: (
        <>
          {regroupedOrderedData.map((item, index) => (
            <Col key={index}>
              <SummarySellerText>{item[0].platformNm}</SummarySellerText>
              <SummaryPriceText>
                {commaToNum(sumUpPrice(item, true))}원
              </SummaryPriceText>
            </Col>
          ))}
          <ShippingPriceText>
            배송비: {commaToNum(totalShippingPrice)}원
          </ShippingPriceText>
          <PriceTotal style={{ alignSelf: "flex-end" }}>
            전체 합계: {commaToNum(totalPrice)}원
          </PriceTotal>
        </>
      ),
      content: <></>,
    },
  ];
};

const StatusBox = styled.View<{ color: string }>`
  background-color: ${({ color }) => color};
  margin-top: 8px;
  padding: 8px 4px;
  border-radius: 4px;
  align-self: flex-start;
  margin-left: -2px;
`;
const StatusText = styled(TextMain)`
  font-size: 14px;
  color: ${colors.white};
  line-height: 18px;
`;

const SummarySellerText = styled(TextMain)`
  font-size: 14px;
  font-weight: bold;
  margin-top: 16px;
  margin-left: 2px;
`;
const SummaryPriceText = styled(TextMain)`
  font-size: 14px;
  margin-top: 2px;
  margin-left: 2px;
`;

const ShippingPriceText = styled(TextSub)`
  align-self: flex-end;
  font-size: 14px;
  margin-top: 32px;
`;

const PriceTotal = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;

  margin-top: 4px;
`;
