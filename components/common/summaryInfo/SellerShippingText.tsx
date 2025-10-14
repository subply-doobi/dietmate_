import { IDietDetailProductData } from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";
import { SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { PlatformSummary } from "@/shared/utils/dietSummary";
import { commaToNum } from "@/shared/utils/sumUp";
import styled from "styled-components/native";

interface ISellerShippingText {
  platformSummary?: PlatformSummary;
  seller: string;
  mainTextColor?: string;
  subTextColor?: string;
  simplified?: boolean;
}
const SellerShippingText = ({
  platformSummary,
  mainTextColor = colors.textMain,
  subTextColor = colors.textSub,
  simplified = false,
}: ISellerShippingText) => {
  if (!platformSummary) return null;
  const {
    platformNm,
    originalTotalPrice,
    changedTotalPrice,
    originalShippingPrice,
    changedShippingPrice,
    originalRemainToFree,
    changedRemainToFree,
    hasChanges,
  } = platformSummary;

  // eShippingText
  const rP =
    changedRemainToFree > 0
      ? `${commaToNum(changedRemainToFree)}원 더 담으면 무료배송`
      : undefined;
  const eP = `${commaToNum(changedTotalPrice)}원`;
  const oSP =
    originalShippingPrice === changedShippingPrice
      ? undefined
      : originalShippingPrice === 0
      ? `무료`
      : originalShippingPrice === undefined
      ? undefined
      : `${commaToNum(originalShippingPrice)}원`;
  const eSP =
    changedShippingPrice === 0
      ? `무료`
      : `${commaToNum(changedShippingPrice)}원`;

  // textColors of eP and ESP when different from oP and oSP
  const ePColor =
    changedTotalPrice === originalTotalPrice ? subTextColor : mainTextColor;
  const eSPColor =
    originalShippingPrice === changedShippingPrice
      ? subTextColor
      : mainTextColor;

  return (
    <Col>
      <Row>
        <Text mainTextColor={mainTextColor}>{platformNm}</Text>
      </Row>
      {!simplified && (
        <Row style={{ columnGap: 4, marginTop: 4 }}>
          <SubText subTextColor={subTextColor}>식품 :</SubText>
          {/* 기존 금액 */}
          <SubText
            subTextColor={subTextColor}
            style={{ textDecorationLine: "line-through" }}
          >
            {originalTotalPrice}
          </SubText>
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
      )}
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
