import {
  useListDietTotalObj,
  useUpdateDietDetail,
} from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { MENU_NUM_LABEL, SCREENHEIGHT } from "@/shared/constants";
import CtaButton from "@/shared/ui/CtaButton";
import {
  commaToNum,
  sumUpDietFromDTOData,
  sumUpPrice,
} from "@/shared/utils/sumUp";
import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import styled from "styled-components/native";
import MenuNumSelect from "../common/cart/MenuNumSelect";
import {
  Col,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import Foodlist from "../screens/lowerShipping/Foodlist";
import { IToastCustomConfigParams } from "@/shared/store/toastStore";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { onLowerShippingTHide } from "@/features/reduxSlices/lowerShippingSlice";

const QtyChangeToast = (props: IToastCustomConfigParams) => {
  // redux
  const dispatch = useAppDispatch();
  const menuIdx = useAppSelector(
    (state) => state.lowerShipping.toastData.qtyChange.menuIdx
  );

  // useState
  const [qty, setQty] = useState(1);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const updateDietDetailMutation = useUpdateDietDetail();

  const {
    dietNo,
    dDData,
    platformNmArr,
    regroupedBySeller,
    currentQty,
    shippingPriceObj,
    curentMenuPrice,
  } = useMemo(() => {
    const dietNoArr = Object.keys(dTOData || {});
    const dietNo = dietNoArr[menuIdx] || "";
    const dDData = dTOData?.[dietNo]?.dietDetail || [];
    const regroupedBySeller = regroupDDataBySeller(dDData);
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);

    // platformNm array without duplicates
    const platformNmArr = Array.from(
      new Set(dDData.map((item) => item.platformNm).filter(Boolean))
    );

    const currentQty = dDData.length > 0 ? parseInt(dDData[0].qty) : 1;
    const curentMenuPrice = sumUpPrice(dDData);

    return {
      dietNo,
      dDData,
      platformNmArr,
      shippingPriceObj,
      regroupedBySeller,
      currentQty,
      curentMenuPrice,
    };
  }, [menuIdx, dTOData]);

  useEffect(() => {
    setQty(currentQty);
  }, [currentQty]);

  // fn
  const onPressQtySave = () => {
    currentQty !== qty &&
      updateDietDetailMutation.mutate({
        dietNo: dietNo,
        qty: String(qty),
      });
    dispatch(onLowerShippingTHide());
    props.hide();
  };

  return (
    <ToastBox>
      <ScrollView style={{ width: "100%" }}>
        <Row
          style={{
            justifyContent: "space-between",
            columnGap: 8,
          }}
        >
          <Title>{MENU_NUM_LABEL[menuIdx]}</Title>
          {currentQty > 1 && <SubText>( x{currentQty} )</SubText>}
          <Title>{commaToNum(curentMenuPrice)}원</Title>
        </Row>
        <Foodlist dDData={dDData} mainTextColor={colors.white} />
        <HorizontalSpace height={64} />

        {/* 현재 근에 포함된 식품사 배송비 합계 */}
        <Col style={{ rowGap: 24 }}>
          {platformNmArr.map((seller, idx) => {
            const dQty = qty - currentQty;
            const dPrice = dQty * sumUpPrice(regroupedBySeller[seller]);
            const oPrice = shippingPriceObj[seller].price;
            const oSPrice = shippingPriceObj[seller].shippingPrice;
            const freeshippingPrice =
              shippingPriceObj[seller].freeShippingPrice;
            const expectedPrice = oPrice + dPrice;
            const isFreeShipping = expectedPrice >= freeshippingPrice;
            const expectedSPrice = isFreeShipping ? 0 : oSPrice;

            return (
              <Col key={idx} style={{ width: "100%" }}>
                <Text style={{ fontWeight: "bold" }}>{seller}</Text>
                <HorizontalSpace height={12} />
                <Row>
                  {dPrice === 0 ? (
                    <Text>식품 : {commaToNum(oPrice)}원</Text>
                  ) : (
                    <TextSub style={{ textDecorationLine: "line-through" }}>
                      식품 : {commaToNum(oPrice)}원
                    </TextSub>
                  )}
                  {dPrice > 0 && <Text> {commaToNum(expectedPrice)}원</Text>}
                </Row>
                {isFreeShipping ? (
                  <TextSub>배송비: {commaToNum(expectedSPrice)}원</TextSub>
                ) : (
                  <TextSub>
                    배송비: {commaToNum(oSPrice)}원 (
                    {commaToNum(freeshippingPrice - oPrice - dPrice)} 원 더
                    구매시 무료)
                  </TextSub>
                )}
              </Col>
            );
          })}
        </Col>
      </ScrollView>
      {currentQty > 0 && (
        <Col style={{ alignSelf: "flex-end" }}>
          <MenuNumSelect
            action="setQty"
            setQty={setQty}
            maxQty={10}
            currentQty={qty}
          />
        </Col>
      )}
      <CtaRow>
        <CtaButton
          btnStyle="border"
          style={{
            flex: 1,
            backgroundColor: undefined,
            borderColor: colors.line,
          }}
          btnTextStyle={{ color: colors.textSub }}
          btnText="취소"
          onPress={() => {
            dispatch(onLowerShippingTHide());
            props.hide();
          }}
        />
        <CtaButton
          btnStyle="border"
          style={{ flex: 1, backgroundColor: undefined }}
          btnTextStyle={{ color: colors.white }}
          btnText="수량 적용"
          onPress={() => onPressQtySave()}
        />
      </CtaRow>
    </ToastBox>
  );
};

export default QtyChangeToast;

const ToastBox = styled.View`
  width: 95%;
  height: ${SCREENHEIGHT * 0.82}px;
  background-color: ${colors.blackOpacity80};
  padding: 24px 16px;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
`;

const Title = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
  color: ${colors.white};
`;

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

const CtaRow = styled.View`
  width: 100%;
  flex-direction: row;
  column-gap: 8px;
  align-items: center;
  margin-top: 40px;
`;
