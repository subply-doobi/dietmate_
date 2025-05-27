import styled from "styled-components/native";
import { icons } from "@/shared/iconSource";
import {
  AccordionContentContainer,
  Col,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { commaToNum } from "@/shared/utils/sumUp";

import { IAddressData } from "@/shared/api/types/address";
import { PAY_METHOD } from "./payConsts";
import Address from "@/components/screens/order/Address";
import FoodToOrder from "@/components/screens/order/FoodToOrder";
import Orderer from "@/components/screens/order/Orderer";
import PaymentMethod from "@/components/screens/order/PaymentMethod";
import { MENU_LABEL, MENU_NUM_LABEL } from "@/shared/constants";

interface IGetOrderAccordionContent {
  menuNum: number;
  productNum: number;
  buyerName: { value: string; isValid: boolean; errMsg: string };
  buyerTel: { value: string; isValid: boolean; errMsg: string };
  listAddressData: IAddressData[] | undefined;
  selectedAddrIdx: number;
  currentPayMethodItem: (typeof PAY_METHOD)[number] | undefined;
  pg: { value: string; isValid: boolean };
  priceTotal: number;
  shippingPrice: number;
}

export const getOrderAccordionContent = ({
  menuNum,
  productNum,
  buyerName,
  buyerTel,
  listAddressData,
  selectedAddrIdx,
  currentPayMethodItem,
  pg,
  priceTotal,
  shippingPrice,
}: IGetOrderAccordionContent) =>
  !listAddressData
    ? [
        {
          activeHeader: <></>,
          inActiveHeader: <></>,
          content: <></>,
        },
      ]
    : [
        {
          activeHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>공식</AccordionHeaderTitle>
              </Col>
              <UpDownArrow source={icons.arrowUp_20} />
            </AccordionHeader>
          ),
          inActiveHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>공식</AccordionHeaderTitle>
                <HeaderSubTitleBox>
                  <Row>
                    <HeaderSubTitle style={{ flex: 1 }}>
                      {MENU_NUM_LABEL[menuNum - 1]} ({productNum}개 식품)
                    </HeaderSubTitle>
                  </Row>
                </HeaderSubTitleBox>
              </Col>
              <UpDownArrow source={icons.arrowDown_20} />
            </AccordionHeader>
          ),
          content: <FoodToOrder />,
        },
        {
          activeHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>주문자</AccordionHeaderTitle>
              </Col>
              <UpDownArrow source={icons.arrowUp_20} />
            </AccordionHeader>
          ),
          inActiveHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>주문자</AccordionHeaderTitle>
                <HeaderSubTitleBox>
                  {buyerName.value ? (
                    <HeaderSubTitle>
                      {buyerName.value} | {buyerTel.value}
                    </HeaderSubTitle>
                  ) : (
                    <HeaderSubTitle>입력해주세요</HeaderSubTitle>
                  )}
                </HeaderSubTitleBox>
              </Col>
              <UpDownArrow source={icons.arrowDown_20} />
            </AccordionHeader>
          ),
          content: <Orderer />,
        },
        {
          activeHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>배송지</AccordionHeaderTitle>
              </Col>
              <UpDownArrow source={icons.arrowUp_20} />
            </AccordionHeader>
          ),
          inActiveHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>배송지</AccordionHeaderTitle>
                <HeaderSubTitleBox>
                  {listAddressData?.length !== 0 ? (
                    <HeaderSubTitle numberOfLines={1} ellipsizeMode={"tail"}>
                      <HeaderSubTitle>
                        {listAddressData &&
                          listAddressData[selectedAddrIdx]?.addr1}{" "}
                        |{" "}
                        {listAddressData &&
                          listAddressData[selectedAddrIdx]?.addr2}
                      </HeaderSubTitle>
                    </HeaderSubTitle>
                  ) : (
                    <HeaderSubTitle>입력해주세요</HeaderSubTitle>
                  )}
                </HeaderSubTitleBox>
              </Col>
              <UpDownArrow source={icons.arrowDown_20} />
            </AccordionHeader>
          ),
          content: <Address />,
        },
        {
          activeHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>결제수단</AccordionHeaderTitle>
              </Col>
              <UpDownArrow source={icons.arrowUp_20} />
            </AccordionHeader>
          ),
          inActiveHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>결제수단</AccordionHeaderTitle>
                <HeaderSubTitleBox>
                  <HeaderSubTitle>
                    {currentPayMethodItem?.label}
                    {currentPayMethodItem?.subBtn
                      ? ` (${
                          currentPayMethodItem.pg.find(
                            (i) => i.value === pg.value
                          )?.label
                        })`
                      : ""}
                  </HeaderSubTitle>
                </HeaderSubTitleBox>
              </Col>
              <UpDownArrow source={icons.arrowDown_20} />
            </AccordionHeader>
          ),
          content: <PaymentMethod />,
        },
        {
          activeHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>결제금액</AccordionHeaderTitle>
              </Col>
              <UpDownArrow source={icons.arrowUp_20} />
            </AccordionHeader>
          ),
          inActiveHeader: (
            <AccordionHeader>
              <Col style={{ flex: 1 }}>
                <AccordionHeaderTitle>결제금액</AccordionHeaderTitle>
                <HeaderSubTitleBox>
                  <HeaderSubTitle>
                    식품가격: {commaToNum(priceTotal)}원 | 배송비:{" "}
                    {commaToNum(shippingPrice)}원
                  </HeaderSubTitle>
                </HeaderSubTitleBox>
              </Col>
              <UpDownArrow source={icons.arrowDown_20} />
            </AccordionHeader>
          ),
          content: (
            <AccordionContentContainer>
              <HeaderSubTitle>
                식품가격: {commaToNum(priceTotal)}원 | 배송비:{" "}
                {commaToNum(shippingPrice)}원
              </HeaderSubTitle>
            </AccordionContentContainer>
          ),
        },
      ];

const AccordionHeader = styled.View`
  flex-direction: row;
  width: 100%;
  height: 64px;
  padding: 0px 16px 0px 16px;
  background-color: ${colors.white};
  align-items: center;
  justify-content: space-between;
`;

const AccordionHeaderTitle = styled(TextMain)`
  font-size: 18px;
  line-height: 22px;
  font-weight: bold;
`;

const HeaderSubTitleBox = styled.View``;

const HeaderSubTitle = styled(TextSub)`
  font-size: 14px;
  line-height: 18px;
  margin-top: 4px;
  margin-left: 1px;
`;
const UpDownArrow = styled.Image`
  width: 20px;
  height: 20px;
  margin-left: 8px;
`;
