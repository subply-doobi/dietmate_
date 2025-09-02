// Description: 장바구니 페이지에서 총 끼니 수, 상품 수, 금액을 보여주는 컴포넌트
//RN, 3rd
import { useEffect, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import styled from "styled-components/native";

//doobi util, redux, etc
import colors from "@/shared/colors";
import { setShippingPrice } from "@/features/reduxSlices/orderSlice";
import { commaToNum, sumUpDietFromDTOData } from "@/shared/utils/sumUp";

//doobi Component
import {
  HorizontalLine,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";

// react-query
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import { MENU_LABEL, MENU_NUM_LABEL } from "@/shared/constants";
import CtaButton from "@/shared/ui/CtaButton";
import SellerShippingText from "@/components/toast/SellerShippingText";
import Icon from "@/shared/ui/Icon";

interface ICartSummary {
  containerStyle?: ViewStyle;
  mainTextColor?: string;
  subTextColor?: string;
  hasLowerShippingCta?: boolean;
}
const CartSummary = ({
  containerStyle,
  hasLowerShippingCta,
  mainTextColor,
  subTextColor,
}: ICartSummary) => {
  // navigation
  const router = useRouter();

  //redux
  const dispatch = useAppDispatch();

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const {
    menuNum,
    productNum,
    priceTotal,
    totalShippingPrice,
    regroupedBySeller,
    shippingPriceObj,
  } = useMemo(() => {
    // 총 끼니 수, 상품 수, 금액 계산
    const {
      menuNum,
      productNum,
      priceTotal,
      totalShippingPrice,
      regroupedBySeller,
      shippingPriceObj,
    } = sumUpDietFromDTOData(dTOData);
    return {
      menuNum,
      productNum,
      priceTotal,
      totalShippingPrice,
      regroupedBySeller,
      shippingPriceObj,
    };
  }, [dTOData]);

  // useEffect
  // 배송비 redux에 저장
  useEffect(() => {
    dispatch(setShippingPrice(totalShippingPrice));
  }, [totalShippingPrice, dispatch]);

  return regroupedBySeller &&
    Object.keys(regroupedBySeller).length === 0 ? null : (
    //장바구니 하단에 보여지는 총 끼니 수, 상품 수, 금액
    <TotalSummaryContainer style={[containerStyle]}>
      <Row style={{ justifyContent: "space-between" }}>
        <SummaryText $color={mainTextColor}>
          공식에 전체 {MENU_NUM_LABEL[menuNum - 1]}이 있어요
        </SummaryText>
        <SummaryValue $color={mainTextColor}>
          근 당{" "}
          {menuNum === 0 ? 0 : commaToNum(Math.floor(priceTotal / menuNum))} 원
        </SummaryValue>
      </Row>
      <HorizontalLine style={{ marginTop: 8 }} />

      {/* 식품사별로 그룹핑 */}
      {Object.keys(regroupedBySeller).map((seller, index) => {
        //식품사별 가격, 배송비 합계
        return (
          <View key={index}>
            <HorizontalSpace height={24} />
            <SellerShippingText
              seller={seller}
              shippingPriceObj={shippingPriceObj}
              mainTextColor={mainTextColor}
              subTextColor={subTextColor}
            />
          </View>
        );
      })}

      <HorizontalLine style={{ marginTop: 24 }} />

      <Row style={{ marginTop: 24, justifyContent: "space-between" }}>
        <SummaryText $color={mainTextColor}>
          상품 가격 (총 {productNum}개)
        </SummaryText>
        <SummaryValue $color={mainTextColor}>
          {commaToNum(priceTotal)} 원
        </SummaryValue>
      </Row>
      <Row style={{ marginTop: 2, justifyContent: "space-between" }}>
        <SummmaryTextSub $color={subTextColor}>배송비 합계</SummmaryTextSub>
        <SummaryValueSub $color={subTextColor}>
          {commaToNum(totalShippingPrice)} 원
        </SummaryValueSub>
      </Row>
      {totalShippingPrice > 0 && hasLowerShippingCta && (
        <CtaButton
          btnStyle="borderActive"
          btnText="배송비를 낮춰봐요"
          btnTextStyle={{
            color: mainTextColor || colors.textSub,
            fontSize: 14,
          }}
          btnContent={() => (
            <Icon
              name="truck"
              color={colors.inactive}
              iconSize={16}
              style={{ marginLeft: -8 }}
            />
          )}
          style={{ marginTop: 24, backgroundColor: "" }}
          onPress={() => {
            router.push({ pathname: "/LowerShipping" });
          }}
        />
      )}
    </TotalSummaryContainer>
  );
};

export default CartSummary;

const TotalSummaryContainer = styled.View`
  /* padding: 0px 16px 104px 16px; */
  /* background-color: ${colors.white}; */
  padding-top: 40px;
`;

const SummaryText = styled(TextMain)<{ $color?: string }>`
  font-size: 14px;
  line-height: 20px;
  color: ${({ $color }) => $color || colors.textMain};
`;

const SummmaryTextSub = styled(TextSub)<{ $color?: string }>`
  font-size: 14px;
  line-height: 20px;
  color: ${({ $color }) => $color || colors.textSub};
`;

const SummaryValue = styled(TextMain)<{ $color?: string }>`
  font-size: 14px;
  font-weight: bold;
  color: ${({ $color }) => $color || colors.textMain};
`;

const SummaryValueSub = styled(TextSub)<{ $color?: string }>`
  font-size: 14px;
  font-weight: bold;
  color: ${({ $color }) => $color || colors.textSub};
`;

const SummarySellerText = styled(TextMain)<{ $color?: string }>`
  font-size: 14px;
  font-weight: bold;
  color: ${({ $color }) => $color || colors.textMain};
`;
