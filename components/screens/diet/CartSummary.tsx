// Description: 장바구니 페이지에서 총 끼니 수, 상품 수, 금액을 보여주는 컴포넌트
//RN, 3rd
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styled from "styled-components/native";

//doobi util, redux, etc
import colors from "@/shared/colors";
import { setShippingPrice } from "@/features/reduxSlices/orderSlice";
import {
  applySortFilter,
  updateSearch,
} from "@/features/reduxSlices/sortFilterSlice";
import { icons } from "@/shared/iconSource";
import { commaToNum, sumUpDietFromDTOData } from "@/shared/utils/sumUp";

//doobi Component
import { HorizontalLine, TextMain, TextSub } from "@/shared/ui/styledComps";

// react-query
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";

const CartSummary = () => {
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

  const onSearchBtnPress = (platformNm: string) => {
    dispatch(updateSearch(platformNm));
    dispatch(applySortFilter());
    router.push({ pathname: "/(tabs)/Search" });
  };

  return regroupedBySeller &&
    Object.keys(regroupedBySeller).length === 0 ? null : (
    //장바구니 하단에 보여지는 총 끼니 수, 상품 수, 금액
    <TotalSummaryContainer>
      <Row style={{ marginTop: 40, justifyContent: "space-between" }}>
        <SummaryText>총 끼니 ({menuNum} 개)</SummaryText>
        <SummaryValue>
          끼니 당{" "}
          {menuNum === 0 ? 0 : commaToNum(Math.floor(priceTotal / menuNum))} 원
        </SummaryValue>
      </Row>
      <HorizontalLine style={{ marginTop: 8 }} />

      {/* 식품사별로 그룹핑 */}
      {Object.keys(regroupedBySeller).map((seller, index) => {
        //식품사별 가격, 배송비 합계
        const { price: sellerPrice, shippingText } = shippingPriceObj[seller];
        // 어느끼니에 속하는지 확인
        let includingDietNoArr: { dietNo: string; dietSeq: string }[] = [];
        for (let food of regroupedBySeller[seller]) {
          includingDietNoArr.every((arr) => arr.dietNo !== food.dietNo) &&
            includingDietNoArr.push({
              dietNo: food.dietNo,
              dietSeq: food.dietSeq,
            });
        }

        return (
          <View key={index}>
            <Row style={{ marginTop: 24, justifyContent: "space-between" }}>
              <SummarySellerText>{seller}</SummarySellerText>
              <SearchBtn onPress={() => onSearchBtnPress(seller)}>
                <SearchImage source={icons.search_18} />
              </SearchBtn>
            </Row>
            <SummaryText style={{ marginTop: 12 }}>
              식품: {commaToNum(sellerPrice)}원
            </SummaryText>
            <TextSub style={{ marginTop: 2 }}>
              배송비:
              {shippingText}
            </TextSub>

            {/* 끼니 버튼 렌더링 컴포넌트 */}
            <Row style={{ marginTop: 16 }}>
              {includingDietNoArr.map((e) => {
                //dietItem.dietSeq가 중복일 경우 하나만 가져오기
                return (
                  <SmallButton
                    key={e.dietNo}
                    onPress={() => {
                      dispatch(
                        openModal({
                          name: "menuNumSelectBS",
                          values: { dietNoToNumControl: e.dietNo },
                        })
                      );
                    }}
                  >
                    <TextMain>{e.dietSeq}</TextMain>
                  </SmallButton>
                );
              })}
            </Row>
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
        <SummaryValueSub>{commaToNum(totalShippingPrice)}원</SummaryValueSub>
      </Row>
    </TotalSummaryContainer>
  );
};

export default CartSummary;

const TotalSummaryContainer = styled.View`
  padding: 0px 16px 104px 16px;
  background-color: ${colors.white};
`;

const SummaryText = styled(TextMain)`
  font-size: 14px;
`;

const SummmaryTextSub = styled(TextSub)`
  font-size: 14px;
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
  margin-right: 12px;
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

const Row = styled.View`
  flex-direction: row;
`;
