// Description: 장바구니 페이지에서 총 끼니 수, 상품 수, 금액을 보여주는 컴포넌트
//RN, 3rd
import { useEffect, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import styled from "styled-components/native";

//doobi util, redux, etc
import colors from "@/shared/colors";
import { setShippingPrice } from "@/features/reduxSlices/orderSlice";
import { icons } from "@/shared/iconSource";
import { commaToNum, sumUpDietFromDTOData } from "@/shared/utils/sumUp";

//doobi Component
import {
  HorizontalLine,
  Icon,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";

// react-query
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import { MENU_NUM_LABEL } from "@/shared/constants";
import CtaButton from "@/shared/ui/CtaButton";

interface ICartSummary {
  containerStyle?: ViewStyle;
  hasLowerShippingCta?: boolean;
}
const CartSummary = ({ containerStyle, hasLowerShippingCta }: ICartSummary) => {
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
        <SummaryText>
          {MENU_NUM_LABEL[menuNum - 1]} 공식을 만들고 있어요
        </SummaryText>
        <SummaryValue>
          근 당{" "}
          {menuNum === 0 ? 0 : commaToNum(Math.floor(priceTotal / menuNum))} 원
        </SummaryValue>
      </Row>
      <HorizontalLine style={{ marginTop: 8 }} />

      {/* 식품사별로 그룹핑 */}
      {Object.keys(regroupedBySeller).map((seller, index) => {
        //식품사별 가격, 배송비 합계
        const { price: sellerPrice, shippingText } = shippingPriceObj[seller];
        return (
          <View key={index}>
            <SummarySellerText style={{ marginTop: 24 }}>
              {seller}
            </SummarySellerText>
            <SummaryText style={{ marginTop: 12 }}>
              식품: {commaToNum(sellerPrice)}원
            </SummaryText>
            <SummmaryTextSub style={{ marginTop: 2 }}>
              배송비:
              {shippingText}
            </SummmaryTextSub>
          </View>
        );
      })}

      <HorizontalLine style={{ marginTop: 24 }} />

      <Row style={{ marginTop: 24, justifyContent: "space-between" }}>
        <SummaryText>상품 가격 (총 {productNum}개)</SummaryText>
        <SummaryValue>{commaToNum(priceTotal)} 원</SummaryValue>
      </Row>
      <Row style={{ marginTop: 2, justifyContent: "space-between" }}>
        <SummmaryTextSub>배송비 합계</SummmaryTextSub>
        <SummaryValueSub>{commaToNum(totalShippingPrice)} 원</SummaryValueSub>
      </Row>
      {totalShippingPrice > 0 && hasLowerShippingCta && (
        <CtaButton
          btnStyle="borderActive"
          btnText="배송비를 낮춰주세요"
          btnTextStyle={{ color: colors.textSub }}
          btnContent={() => <Icon source={icons.truck_24} size={24} />}
          style={{ marginTop: 24 }}
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
  background-color: ${colors.white};
  padding-top: 40px;
`;

const SummaryText = styled(TextMain)`
  font-size: 14px;
  line-height: 20px;
`;

const SummmaryTextSub = styled(TextSub)`
  font-size: 14px;
  line-height: 20px;
`;

const SummaryValue = styled(TextMain)`
  font-size: 14px;
  font-weight: bold;
`;
const SummaryValueSub = styled(TextSub)`
  font-size: 14px;
  font-weight: bold;
`;

const SummarySellerText = styled(TextMain)`
  font-size: 14px;
  font-weight: bold;
`;

const SmallButton = styled.TouchableOpacity`
  width: 46px;
  height: 32px;
  border-radius: 5px;
  border: 1px solid ${colors.lineLight};
  justify-content: center;
  align-items: center;
`;

const SearchImage = styled.Image`
  width: 24px;
  height: 24px;
`;

const SearchBtn = styled.TouchableOpacity`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 32px;
  height: 32px;
  background-color: ${colors.backgroundLight2};
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`;
