import { IDietDetailProductData } from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";
import { SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import {
  commaToNum,
  IShippingPriceObj,
  IShippingPriceValues,
} from "@/shared/utils/sumUp";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

interface ISellerShippingText {
  shippingPriceObj: IShippingPriceObj;
  seller: string;
  productToDel?: IProductData | IDietDetailProductData;
  productToAdd?: IProductData;
  mainTextColor?: string;
  subTextColor?: string;
}
const SellerShippingText = ({
  shippingPriceObj,
  seller,
  productToDel,
  productToAdd,
  mainTextColor = colors.textMain,
  subTextColor = colors.textSub,
}: ISellerShippingText) => {
  const priceToDel =
    productToDel?.platformNm === seller
      ? parseInt(productToDel.price) + SERVICE_PRICE_PER_PRODUCT
      : 0;
  const priceToAdd =
    productToAdd?.platformNm === seller
      ? parseInt(productToAdd.price) + SERVICE_PRICE_PER_PRODUCT
      : 0;

  // oPrice, EPrice
  const oPrice = shippingPriceObj[seller]?.price || undefined;
  const ePrice = (oPrice || 0) + priceToAdd - priceToDel;

  // sellerShippingPrice, freeShippingPrice, eShippingPrice
  let sellerShippingPrice = shippingPriceObj[seller]
    ? shippingPriceObj[seller].sellerShippingPrice
    : productToAdd
    ? parseInt(productToAdd.shippingPrice)
    : 0;
  let fShippingPrice = 0;
  if (shippingPriceObj[seller]) {
    fShippingPrice = shippingPriceObj[seller].freeShippingPrice;
  } else if (productToAdd?.platformNm === seller) {
    fShippingPrice = parseInt(productToAdd.freeShippingPrice);
  } else if (productToDel?.platformNm === seller) {
    fShippingPrice = parseInt(productToDel.freeShippingPrice);
  }
  const oShippingPrice = shippingPriceObj[seller]?.shippingPrice || undefined;
  const eShippingPrice = ePrice >= fShippingPrice ? 0 : sellerShippingPrice;

  const rPrice = fShippingPrice - ePrice;

  // eShippingText
  const oP =
    oPrice === undefined
      ? undefined
      : oPrice === ePrice
      ? undefined
      : commaToNum(oPrice);
  const rP =
    rPrice > 0 ? `${commaToNum(rPrice)}원 더 담으면 무료배송` : undefined;
  const eP = `${commaToNum(ePrice)}원`;
  const oSP =
    oShippingPrice === eShippingPrice
      ? undefined
      : oShippingPrice === 0
      ? `무료`
      : oShippingPrice === undefined
      ? undefined
      : `${commaToNum(oShippingPrice)}원`;
  const eSP = eShippingPrice === 0 ? `무료` : `${commaToNum(eShippingPrice)}원`;

  // textColors of eP and ESP when different from oP and oSP
  const ePColor = ePrice === oPrice ? subTextColor : mainTextColor;
  const eSPColor =
    eShippingPrice === oShippingPrice ? subTextColor : mainTextColor;

  return (
    <Col>
      <Row>
        <Text mainTextColor={mainTextColor}>{seller}</Text>
      </Row>
      <Row style={{ columnGap: 4, marginTop: 4 }}>
        <SubText subTextColor={subTextColor}>식품 :</SubText>
        {/* 기존 금액 */}
        {oPrice && (
          <SubText
            subTextColor={subTextColor}
            style={{ textDecorationLine: "line-through" }}
          >
            {oP}
          </SubText>
        )}
        {/* 예상 금액 */}
        {
          <SubText
            subTextColor={subTextColor}
            style={{
              color: ePColor,
            }}
          >
            {eP}
          </SubText>
        }
      </Row>
      {ePrice > 0 && (
        <Row style={{ columnGap: 4 }}>
          <SubText subTextColor={subTextColor}>배송비:</SubText>
          {/* 기존 배송비 */}
          {oSP && (
            <SubText
              subTextColor={subTextColor}
              style={{ textDecorationLine: "line-through" }}
            >
              {oSP}
            </SubText>
          )}
          {/* 예상 배송비, 남은 금액 */}
          <SubText subTextColor={subTextColor} style={{ color: eSPColor }}>
            {eSP}
          </SubText>
          {rP && <SubText subTextColor={subTextColor}>({rP})</SubText>}
        </Row>
      )}
    </Col>
  );
};

export default SellerShippingText;

const Text = styled(TextMain)<{ mainTextColor: string }>`
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: ${({ mainTextColor }) => mainTextColor || colors.textMain};
`;

const SubText = styled(TextSub)<{ subTextColor: string }>`
  font-size: 12px;
  line-height: 16px;
  color: ${({ subTextColor }) => subTextColor || colors.textSub};
`;
