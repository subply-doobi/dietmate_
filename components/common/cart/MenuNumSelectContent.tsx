// RN, expo
import { useState, useEffect, useMemo } from "react";
import { ScrollView, TouchableWithoutFeedback } from "react-native";

// 3rd
import styled from "styled-components/native";
import {
  useListDietTotalObj,
  useUpdateDietDetail,
} from "@/shared/api/queries/diet";

// doobi
import {
  BtnCTA,
  BtnText,
  Col,
  HorizontalLine,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import MenuNumSelect from "../../common/cart/MenuNumSelect";
import { commaToNum, sumUpPrice } from "@/shared/utils/sumUp";
import colors from "@/shared/colors";
import {
  ENV,
  SCREENHEIGHT,
  SCREENWIDTH,
  SERVICE_PRICE_PER_PRODUCT,
} from "@/shared/constants";
import { reGroupBySellerFromDTOData } from "@/shared/utils/dataTransform";
import { closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const MenuNumSelectContent = () => {
  // redux
  const dispatch = useAppDispatch();
  const dietNoToNumControl = useAppSelector(
    (state) => state.modal.values.menuNumSelectBS.dietNoToNumControl
  ) as string;

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const updateDietDetailMutation = useUpdateDietDetail();

  // state
  const [qty, setQty] = useState(1);

  // useMemo
  const { dDData, dietSeq, currentDietBySeller, otherDietBySeller } =
    useMemo(() => {
      const dDData = dTOData?.[dietNoToNumControl]?.dietDetail ?? [];
      dDData.length > 0 && setQty(parseInt(dDData[0].qty));

      const dietSeq = dTOData?.[dietNoToNumControl]?.dietSeq ?? "";

      const dTODataBySeller = reGroupBySellerFromDTOData(dTOData);
      const currentDietBySeller = {
        [dietNoToNumControl]: dTODataBySeller[dietNoToNumControl],
      };
      const dietNoArr = dTOData ? Object.keys(dTOData) : [];
      const otherDietNoArr = dietNoArr.filter((p) => p !== dietNoToNumControl);
      let otherDietBySeller: typeof dTODataBySeller = {};
      otherDietNoArr.forEach((dietNo) => {
        otherDietBySeller[dietNo] = dTODataBySeller[dietNo];
      });

      return { dDData, dietSeq, currentDietBySeller, otherDietBySeller };
    }, [dTOData]);

  // useEffect
  useEffect(() => {
    dDData && dDData.length > 0 && setQty(parseInt(dDData[0].qty));
  }, [dDData]);

  const saveQty = () => {
    updateDietDetailMutation.mutate({
      dietNo: dietNoToNumControl,
      qty: String(qty),
    });
    dispatch(closeModal({ name: "menuNumSelectBS" }));
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 168 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback>
          <Col>
            <HorizontalSpace height={24} />
            <TitleText>{dietSeq}</TitleText>

            {/* 현재 끼니 식품 리스트 */}
            <HorizontalSpace height={8} />
            {dDData.map((food, idx) => (
              <Row
                key={idx}
                style={{
                  width: SCREENWIDTH - 32 - 40 - 8,
                  marginTop: 16,
                }}
              >
                <ThumbnailImg
                  source={{
                    uri: `${ENV.BASE_URL}${food.mainAttUrl}`,
                  }}
                />
                <Col
                  style={{
                    width: "100%",
                    marginLeft: 8,
                  }}
                >
                  <TextGrey>{food.platformNm}</TextGrey>
                  <Row
                    style={{
                      width: "100%",
                    }}
                  >
                    <Col style={{ flex: 1 }}>
                      <Text numberOfLines={1} ellipsizeMode="tail">
                        {food.productNm}
                      </Text>
                    </Col>
                    <TextGrey style={{ marginLeft: 8, textAlign: "right" }}>
                      {commaToNum(
                        parseInt(food.price) + SERVICE_PRICE_PER_PRODUCT
                      )}
                      원
                    </TextGrey>
                  </Row>
                </Col>
              </Row>
            ))}
            <HorizontalLine style={{ marginTop: 24 }} />

            {/* 전체 끼니 중 현재 끼니 판매자별 금액 보여주기 */}
            <HorizontalSpace height={24} />
            <TitleText>해당 식품사 총 금액</TitleText>
            <HorizontalSpace height={8} />
            {dDData?.length > 0 &&
              Object.keys(currentDietBySeller[dietNoToNumControl]).map(
                (seller, idx) => {
                  const currentDietSellerPrice =
                    sumUpPrice(
                      currentDietBySeller[dietNoToNumControl]?.[seller]
                    ) * qty;
                  let otherDietSellerPrice = 0;
                  for (let dietNo of Object.keys(otherDietBySeller)) {
                    otherDietSellerPrice += sumUpPrice(
                      otherDietBySeller[dietNo]?.[seller],
                      true
                    );
                  }
                  const sellerPrice =
                    currentDietSellerPrice + otherDietSellerPrice;
                  const sellerShippingPrice = parseInt(
                    currentDietBySeller[dietNoToNumControl]?.[seller]?.[0]
                      ?.shippingPrice,
                    10
                  );
                  const freeShippingPrice = parseInt(
                    currentDietBySeller[dietNoToNumControl]?.[seller]?.[0]
                      ?.freeShippingPrice,
                    10
                  );
                  const noticeText =
                    freeShippingPrice <= sellerPrice
                      ? "무료"
                      : `${commaToNum(sellerShippingPrice)}원 (${commaToNum(
                          freeShippingPrice - sellerPrice
                        )}원 더 담으면 무료배송)`;
                  return (
                    <Col key={idx} style={{ marginTop: 16 }}>
                      <Text>{seller}</Text>
                      <HorizontalSpace height={12} />
                      <TextGrey>식품 : {commaToNum(sellerPrice)}원</TextGrey>
                      <TextGrey>배송비 : {noticeText}</TextGrey>
                    </Col>
                  );
                }
              )}
          </Col>
        </TouchableWithoutFeedback>
      </ScrollView>

      <Col style={{ marginTop: -144 }}>
        {/* 수량조절버튼 */}
        <Col style={{ alignSelf: "flex-end" }}>
          <MenuNumSelect
            disabled={!dDData || dDData.length === 0}
            action="setQty"
            setQty={setQty}
            currentQty={qty}
          />
        </Col>
        <HorizontalSpace height={40} />

        {/* 취소 - 수량적용 버튼 */}
        <BtnBox>
          <BtnCTA
            height={48}
            width={(SCREENWIDTH - 16 - 16 - 8) / 2}
            btnStyle="border"
            onPress={() => dispatch(closeModal({ name: "menuNumSelectBS" }))}
          >
            <BtnText style={{ color: colors.textSub }}>취소</BtnText>
          </BtnCTA>
          <BtnCTA
            height={48}
            width={(SCREENWIDTH - 16 - 16 - 8) / 2}
            btnStyle="activated"
            onPress={() => saveQty()}
          >
            <BtnText>수량 적용</BtnText>
          </BtnCTA>
        </BtnBox>
      </Col>
    </Container>
  );
};

export default MenuNumSelectContent;

const Container = styled.View`
  width: ${SCREENWIDTH - 32}px;
  height: ${SCREENHEIGHT - 200}px;
`;

const TitleText = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
`;

const ThumbnailImg = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 5px;
`;

const TextGrey = styled(TextSub)`
  font-size: 14px;
`;
const Text = styled(TextMain)`
  font-size: 14px;
`;

const BtnBox = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;
