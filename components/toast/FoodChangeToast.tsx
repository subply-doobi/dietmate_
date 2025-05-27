import {
  useCreateDietDetail,
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import {
  MENU_LABEL,
  NUTR_ERROR_RANGE,
  SCREENHEIGHT,
  SERVICE_PRICE_PER_PRODUCT,
} from "@/shared/constants";
import { IToastCustomConfigParams } from "@/shared/store/toastStore";
import CtaButton from "@/shared/ui/CtaButton";
import {
  Col,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import {
  commaToNum,
  getSortedShippingPriceObj,
  sumUpDietFromDTOData,
  sumUpPrice,
} from "@/shared/utils/sumUp";
import { useEffect, useMemo, useRef } from "react";
import { ScrollView } from "react-native";
import styled from "styled-components/native";
import NutrientsProgress from "../common/nutrient/NutrientsProgress";
import FoodlistToMod from "./FoodlistToMod";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { onLowerShippingTHide } from "@/features/reduxSlices/lowerShippingSlice";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import SummaryBox, { IShippingSummaryObj } from "./SummaryBox";
import DTooltip from "@/shared/ui/DTooltip";

const FoodChangeToast = (props: IToastCustomConfigParams) => {
  // redux
  const dispatch = useAppDispatch();
  const menuWithChangeAvailableFoods = useAppSelector(
    (state) =>
      state.lowerShipping.toastData.foodChange.menuWithChangeAvailableFoods
  );
  const productToDel = useAppSelector(
    (state) => state.lowerShipping.toastData.foodChange.productToDel
  );
  const productToAdd = useAppSelector(
    (state) => state.lowerShipping.toastData.foodChange.productToAdd
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietDetailMutation = useDeleteDietDetail();
  const createDietDetailMutation = useCreateDietDetail();

  // useRef
  const scrollRef = useRef<ScrollView>(null);

  const {
    dietNo,
    dDData,
    currentQty,
    currentMenuPrice,
    firstTargetSeller,
    shippingPriceObj,
    freeShippingPObjArr,
  } = useMemo(() => {
    const currentIdx = menuWithChangeAvailableFoods?.index;
    const dietNo = Object.keys(dTOData || {})[currentIdx] || "";
    const dDData = menuWithChangeAvailableFoods?.dietDetailData || [];
    const currentQty = dDData.length > 0 ? parseInt(dDData[0].qty) : 1;
    const currentMenuPrice = sumUpPrice(dDData);
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);
    const { free, notFree } = getSortedShippingPriceObj(shippingPriceObj);

    const firstTargetSeller = notFree[0];

    return {
      dietNo,
      dDData,
      currentQty,
      currentMenuPrice,
      firstTargetSeller,
      shippingPriceObj,
      freeShippingPObjArr: free,
    };
  }, [dTOData, menuWithChangeAvailableFoods]);

  // etc
  const menuIdx = menuWithChangeAvailableFoods.index;
  const menuChangedAvailable =
    menuWithChangeAvailableFoods.changeAvailableFoods;
  const productToDelPNo = productToDel?.productNo;
  const productToAddPNo = productToAdd?.productNo;
  const foodlistToAdd = productToDelPNo
    ? menuChangedAvailable[productToDelPNo] || []
    : [];

  const { expectedDData, expectedCurrentMenuPrice, shippingSummaryObj } =
    useMemo(() => {
      // current dietDetail Data minus productToDel and plus productToAdd
      if (!dTOData)
        return {
          expectedDData: [],
          expectedCurrentMenuPrice: 0,
          shippingSummaryObj: {},
        };
      let expectedDData = [...dDData];

      let shippingSummaryObj: IShippingSummaryObj = {};
      const {
        price: targetOPrice,
        freeShippingPrice: targetFSPrice,
        remainPrice: targetORPrice,
        shippingPrice: targetOSPrice,
      } = shippingPriceObj[firstTargetSeller.platformNm];

      shippingSummaryObj[firstTargetSeller.platformNm] = {
        freeShippingPrice: targetFSPrice,
        oPrice: targetOPrice,
        oRemainPrice: targetORPrice,
        oShippingPrice: targetOSPrice,
        ePrice: targetOPrice,
        eRemainPrice: targetORPrice,
        eShippingPrice: targetOSPrice,
      };

      if (productToDel) {
        expectedDData = expectedDData.filter(
          (item) => item.productNo !== productToDelPNo
        );
        const platformNmToDel = productToDel.platformNm;
        const {
          freeShippingPrice: delFSPrice,
          price: delOPrice,
          remainPrice: delORPrice,
          shippingPrice: delOSPrice,
        } = shippingPriceObj[platformNmToDel];
        const delDPrice =
          (parseInt(productToDel.price) + SERVICE_PRICE_PER_PRODUCT) *
          currentQty;
        const delEPrice = delOPrice - delDPrice;
        const delERPrice = delORPrice + delDPrice;
        const delESPrice =
          delEPrice >= delFSPrice ? 0 : parseInt(productToDel.shippingPrice);
        shippingSummaryObj[platformNmToDel] = {
          freeShippingPrice: delFSPrice,
          oPrice: delOPrice,
          oRemainPrice: delORPrice,
          oShippingPrice: delOSPrice,
          ePrice: delEPrice,
          eRemainPrice: delERPrice,
          eShippingPrice: delESPrice,
        };
      }

      if (productToAdd) {
        expectedDData.push(productToAdd as IDietDetailProductData);
        const platformNmToAdd = productToAdd.platformNm;
        const {
          freeShippingPrice: addFSPrice,
          price: addOPrice,
          remainPrice: addORPrice,
          shippingPrice: addOSPrice,
        } = shippingPriceObj[platformNmToAdd] || {
          freeShippingPrice: parseInt(productToAdd.freeShippingPrice),
          price: 0,
          remainPrice: parseInt(productToAdd.freeShippingPrice),
          shippingPrice: parseInt(productToAdd.shippingPrice),
        };

        const isExist =
          Object.keys(shippingSummaryObj).includes(platformNmToAdd);

        const addDPrice =
          (parseInt(productToAdd.price) + SERVICE_PRICE_PER_PRODUCT) *
          currentQty;
        const addEPrice = isExist
          ? shippingSummaryObj[platformNmToAdd].ePrice + addDPrice
          : addOPrice + addDPrice;
        const addERPrice = isExist
          ? shippingSummaryObj[platformNmToAdd].eRemainPrice - addDPrice
          : addORPrice - addDPrice;
        const addESPrice =
          addEPrice >= addFSPrice ? 0 : parseInt(productToAdd.shippingPrice);

        shippingSummaryObj[platformNmToAdd] = {
          freeShippingPrice: addFSPrice,
          oPrice: addOPrice,
          oRemainPrice: addORPrice,
          oShippingPrice: addOSPrice,
          ePrice: addEPrice,
          eRemainPrice: addERPrice,
          eShippingPrice: addESPrice,
        };
      }
      const expectedCurrentMenuPrice = sumUpPrice(expectedDData);
      return { expectedDData, expectedCurrentMenuPrice, shippingSummaryObj };
    }, [productToAdd, productToDel]);

  // fn
  const onChangeFoodPress = async () => {
    if (!dietNo || !productToDelPNo || !productToAdd) return;
    await deleteDietDetailMutation.mutateAsync({
      dietNo,
      productNo: productToDelPNo,
    });
    await createDietDetailMutation.mutateAsync({
      dietNo,
      food: productToAdd,
    });
    dispatch(onLowerShippingTHide());
    props.hide();
  };

  useEffect(() => {
    if (!productToAdd) return;
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  }, [productToAdd]);

  return (
    <ToastBox>
      <ScrollView
        ref={scrollRef}
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Row
          style={{
            justifyContent: "space-between",
            columnGap: 8,
          }}
        >
          <Row style={{ columnGap: 8 }}>
            <Title>{MENU_LABEL[menuIdx]}</Title>
            {currentQty > 1 && <SubText>( x{currentQty} )</SubText>}
          </Row>
          <Row style={{ columnGap: 8 }}>
            {currentMenuPrice !== expectedCurrentMenuPrice && (
              <Title
                style={{
                  textDecorationLine: "line-through",
                  color: colors.textSub,
                }}
              >
                {commaToNum(currentMenuPrice)}원
              </Title>
            )}
            <Title>{commaToNum(expectedCurrentMenuPrice)}원</Title>
          </Row>
        </Row>
        <HorizontalSpace height={16} />
        <NutrientsProgress
          dietDetailData={expectedDData}
          textColor={colors.inactive}
        />

        {/* 삭제할 식품 */}
        <Text style={{ marginTop: 40 }}>
          현재 근에서 뺄 식품을 선택해주세요
        </Text>
        <FoodlistToMod
          type="del"
          foods={dDData}
          shippingPriceObj={shippingPriceObj}
        />

        {/* 배송합계 */}
        {productToDel && (
          <SummaryContainer>
            <SummaryBox
              shippingSummaryObj={shippingSummaryObj}
              seller={productToDel.platformNm}
            />
          </SummaryContainer>
        )}

        {/* 추가할 식품 */}
        {productToDelPNo && foodlistToAdd.length > 0 && (
          <>
            <Text style={{ marginTop: 40 }}>
              현재 근에 더할 식품을 선택해주세요
            </Text>
            <FoodlistToMod
              type="add"
              foods={foodlistToAdd}
              shippingPriceObj={shippingPriceObj}
            />
          </>
        )}

        {/* 배송합계 */}
        {productToAdd && (
          <SummaryContainer>
            <SummaryBox
              shippingSummaryObj={shippingSummaryObj}
              seller={productToAdd.platformNm}
            />
          </SummaryContainer>
        )}

        {/* <SummaryBox>
          {Object.keys(shippingSummaryObj).map((seller, idx) => {
            const {
              freeShippingPrice,
              oPrice,
              oShippingPrice,
              ePrice,
              eRemainPrice,
              eShippingPrice,
            } = shippingSummaryObj[seller];
            const isFreeShipping = ePrice >= freeShippingPrice;

            return (
              <Col key={idx}>
                <Row>
                  <Text style={{ fontWeight: "bold" }}>{seller}</Text>
                  <SubText>
                    {"   "}(
                    {commaToNum(shippingSummaryObj[seller].freeShippingPrice)}{" "}
                    원 이상 무료배송)
                  </SubText>
                </Row>
                <Row style={{ columnGap: 4, marginTop: 4 }}>
                  <SubText>식품 :</SubText>
                  {ePrice !== oPrice && (
                    <SubText style={{ textDecorationLine: "line-through" }}>
                      {commaToNum(oPrice)}원
                    </SubText>
                  )}
                  {ePrice > 0 && (
                    <SubText
                      style={{
                        color:
                          ePrice === oPrice ? colors.textSub : colors.white,
                      }}
                    >
                      {commaToNum(ePrice)}원
                    </SubText>
                  )}
                </Row>
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
                    {eShippingPrice === 0
                      ? `무료`
                      : `${commaToNum(eShippingPrice)}원`}
                  </SubText>
                </Row>
              </Col>
            );
          })}
        </SummaryBox> */}
      </ScrollView>

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
          btnText="식품 변경"
          onPress={() => onChangeFoodPress()}
        />
        <DTooltip
          tooltipShow={productToDel && productToAdd ? false : true}
          text={`삭제/추가할 식품을 모두 선택해주세요`}
          reversed={true}
          boxBottom={-40}
          boxRight={0}
          triangleRight={30}
          color={colors.brown}
        />
      </CtaRow>
    </ToastBox>
  );
};

export default FoodChangeToast;

const ToastBox = styled.View`
  width: 95%;
  height: ${SCREENHEIGHT * 0.88}px;
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

const SummaryContainer = styled.View`
  width: 100%;
  margin-top: 24px;
  padding: 24px 16px;
  background-color: ${colors.blackOpacity80};
  row-gap: 16px;
`;

const CtaRow = styled.View`
  width: 100%;
  flex-direction: row;
  column-gap: 8px;
  align-items: center;
`;
