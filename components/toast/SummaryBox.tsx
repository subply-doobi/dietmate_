import colors from "@/shared/colors";
import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { commaToNum, IShippingPriceValues } from "@/shared/utils/sumUp";
import styled from "styled-components/native";

export interface IShippingSummaryObj {
  [key: string]: {
    freeShippingPrice: number;
    oPrice: number;
    oRemainPrice: number;
    oShippingPrice: number;
    ePrice: number;
    eRemainPrice: number;
    eShippingPrice: number;
  };
}

interface ISummaryBox {
  shippingSummaryObj: IShippingSummaryObj;
  seller: string;
}
const SummaryBox = ({ shippingSummaryObj, seller }: ISummaryBox) => {
  const {
    freeShippingPrice,
    oPrice,
    oRemainPrice,
    oShippingPrice,
    ePrice,
    eRemainPrice,
    eShippingPrice,
  } = shippingSummaryObj[seller];

  return (
    <Col>
      <Row>
        <Text style={{ fontWeight: "bold" }}>{seller}</Text>
      </Row>
      <Row style={{ columnGap: 4, marginTop: 4 }}>
        <SubText>식품 :</SubText>
        {ePrice !== oPrice && (
          <SubText style={{ textDecorationLine: "line-through" }}>
            {commaToNum(oPrice)}원
          </SubText>
        )}
        {
          <SubText
            style={{
              color: ePrice === oPrice ? colors.textSub : colors.white,
            }}
          >
            {commaToNum(ePrice)}원
          </SubText>
        }
      </Row>
      {ePrice > 0 && (
        <Row style={{ columnGap: 4 }}>
          <SubText>배송비:</SubText>
          {oShippingPrice !== eShippingPrice && (
            <SubText style={{ textDecorationLine: "line-through" }}>
              {oShippingPrice === 0
                ? `무료`
                : `${commaToNum(oShippingPrice)}원`}
            </SubText>
          )}
          <SubText>
            {eShippingPrice === 0 ? `무료` : `${commaToNum(eShippingPrice)}원`}
          </SubText>
          {eShippingPrice > 0 && (
            <SubText>
              {" "}
              ({commaToNum(shippingSummaryObj[seller].freeShippingPrice)}원 이상
              무료배송)
            </SubText>
          )}
        </Row>
      )}
    </Col>
  );
};

export default SummaryBox;

const Text = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.white};
`;

const SubText = styled(TextSub)`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.textSub};
`;
