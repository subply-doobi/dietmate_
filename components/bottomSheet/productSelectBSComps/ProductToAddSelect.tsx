import NutrientsProgress from "@/components/common/nutrient/NutrientsProgress";
import ProductSelectFoodlist from "@/components/bottomSheet/productSelectBSComps/ProductSelectFoodlist";
import ProductSelectTShippingInfo from "@/components/bottomSheet/productSelectBSComps/ProductSelectShippingInfo";
import {
  closeBS,
  deleteBSProduct,
  expandBS,
  snapBS,
} from "@/features/reduxSlices/bottomSheetSlice";
import { setRecentlyOpenedFoodsPNoArr } from "@/features/reduxSlices/filteredPSlice";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";
import {
  useCreateDietDetail,
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import colors from "@/shared/colors";
import { ENV, MENU_LABEL, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import Icon from "@/shared/ui/Icon";
import {
  Col,
  HorizontalLine,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import {
  addToRecentProduct,
  getRecentProducts,
} from "@/shared/utils/asyncStorage";
import { commaToNum } from "@/shared/utils/sumUp";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

/**
 * - 선택 분기
 *
 * 1. /AutoAdd 에서 선택하면
 * => pToAdd 있고 (pToDel는 식품 교체 선택한 경우 있을 수 있음) pathName === "/AutoAdd"
 * => 식품 추가, 정보확인 가능
 *
 * 2. /Search 에서 선택하면
 * => pToAdd 있고 pathName === "/Search"
 * => 근 선택, 식품 추가, 정보확인 가능
 */

const ProductToAddSelect = () => {
  // navigation
  const router = useRouter();
  const pathNm = usePathname();

  // redux
  const dispatch = useAppDispatch();
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const { pToAdd, pToDel } = useAppSelector(
    (state) => state.bottomSheet.bsData
  );
  const bsValue = useAppSelector((state) => state.bottomSheet.currentValue);
  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietDetailMutation = useDeleteDietDetail();
  const createDietDetailMutation = useCreateDietDetail();

  // etc
  const numOfMenu = Object.keys(dTOData || {}).length;
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx] || "";
  const currentMenu = dTOData?.[currentDietNo]?.dietDetail || [];
  const MenuLabel = MENU_LABEL[currentFMCIdx];
  const isIncluded = currentMenu.some(
    (m) => m.productNo === pToAdd[0]?.productNo
  );
  // const expectedMenu = pToAdd[0]
  //   ? currentMenu
  //       .filter((m) => m.productNo !== pToDel[0]?.productNo)
  //       .concat(pToAdd[0] as IDietDetailProductData)
  //   : currentMenu;
  const expectedMenu =
    !!pToAdd[0] && !isIncluded
      ? currentMenu
          .filter((m) => m.productNo !== pToDel[0]?.productNo)
          .concat(pToAdd[0] as IDietDetailProductData)
      : isIncluded
      ? currentMenu.filter((m) => m.productNo !== pToAdd[0]?.productNo)
      : currentMenu;

  const ctaText = isIncluded
    ? "식품 삭제하기"
    : pToDel[0]
    ? "식품 교체하기"
    : "식품 추가하기";

  // fn
  const onArrowLeftPress = () => {
    if (pathNm === "/AutoAdd" || numOfMenu === 0) return;
    if (currentFMCIdx === 0) return;
    dispatch(setCurrentFMCIdx(currentFMCIdx - 1));
  };
  const onArrowRightPress = () => {
    if (pathNm === "/AutoAdd" || numOfMenu === 0) return;
    if (currentFMCIdx === numOfMenu - 1) return;
    dispatch(setCurrentFMCIdx(currentFMCIdx + 1));
  };

  const onPressInfo = async () => {
    if (!pToAdd) {
      return;
    }

    await addToRecentProduct(pToAdd[0]?.productNo);
    const recentlyOpenedFoodsPNoArr = await getRecentProducts();
    dispatch(setRecentlyOpenedFoodsPNoArr(recentlyOpenedFoodsPNoArr));
    setTimeout(() => {
      router.push({
        pathname: "/FoodDetail",
        params: { productNo: pToAdd[0]?.productNo, type: "infoOnly" },
      });
    }, 200);
  };

  const onPressAdd = () => {
    setTimeout(async () => {
      if (isIncluded) {
        deleteDietDetailMutation.mutate({
          dietNo: currentDietNo,
          productNo: pToAdd[0].productNo,
        });
        return;
      }
      pToDel[0] &&
        (await deleteDietDetailMutation.mutateAsync({
          dietNo: currentDietNo,
          productNo: pToDel[0].productNo,
        }));
      await createDietDetailMutation.mutateAsync({
        dietNo: currentDietNo,
        food: pToAdd[0],
      });
    }, 10);
    dispatch(deleteBSProduct());
    setTimeout(() => {
      dispatch(
        closeBS({ bsNm: "productToAddSelect", from: "ProductToAddSelect.tsx" })
      );
      if (pathNm !== "/Search") {
        router.back();
      }
    }, 250);
  };

  return (
    <Box>
      {/* 주요정보 : 현재 근, 담긴 식품 */}
      <Row
        style={{
          justifyContent: pathNm === "/AutoAdd" ? "center" : "space-between",
          width: "100%",
          height: 32,
          marginTop: -8,
        }}
      >
        {pathNm !== "/AutoAdd" && (
          <LRBtn onPress={onArrowLeftPress} style={{ marginLeft: -12 }}>
            <Icon name="chevronLeft" color={colors.textSub} />
          </LRBtn>
        )}
        <LRBtn>
          <Row style={{ columnGap: 2 }}>
            <Icon name="appIcon" iconSize={20} />
            <ProductNm style={{ fontWeight: 600 }}>{MenuLabel}</ProductNm>
          </Row>
        </LRBtn>
        {pathNm !== "/AutoAdd" && (
          <LRBtn onPress={onArrowRightPress} style={{ marginRight: -12 }}>
            <Icon name="chevronRight" color={colors.textSub} />
          </LRBtn>
        )}
      </Row>

      {/* 영양정보 */}
      <NutrientsProgress
        dietDetailData={expectedMenu}
        textColor={colors.textSub}
      />

      {/* 현재 근 식품 확인 */}
      <HorizontalSpace height={12} />
      <ProductSelectFoodlist foods={currentMenu} />
      <HorizontalSpace height={16} />
      <HorizontalLine lineColor={colors.whiteOpacity30} />

      {!!pToAdd[0] && (
        <>
          {/* 썸네일, 식품사, 식품명, 영양정보 */}
          <HorizontalSpace height={16} />
          {!!pToAdd[0] && (
            <CtaRow>
              <InfoBtn onPress={onPressInfo}>
                <Image
                  source={{ uri: `${ENV.BASE_URL}${pToAdd[0].mainAttUrl}` }}
                  style={{ borderRadius: 4, width: 52, height: 52 }}
                />
                <Col style={{ flex: 1 }}>
                  {!!pToDel[0] && (
                    <ProductNm
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      style={{
                        color: colors.textSub,
                        textDecorationLine: "line-through",
                        fontWeight: "200",
                      }}
                    >
                      [{pToDel[0]?.platformNm}] {pToDel[0]?.productNm}
                    </ProductNm>
                  )}
                  <ProductNm numberOfLines={1} ellipsizeMode="tail">
                    {pToAdd[0].productNm}
                  </ProductNm>
                  <NutrText>{`칼:${parseInt(
                    pToAdd[0].calorie
                  )}kcal  탄:${parseInt(pToAdd[0]?.carb)}g  단:${parseInt(
                    pToAdd[0].protein
                  )}g  지:${parseInt(pToAdd[0]?.fat)}g | ${commaToNum(
                    parseInt(pToAdd[0].price) + SERVICE_PRICE_PER_PRODUCT
                  )}원`}</NutrText>
                </Col>
              </InfoBtn>
              {bsValue.index === 1 && (
                <CTA onPress={onPressAdd}>
                  <Icon
                    name={
                      isIncluded
                        ? "cancelCircle"
                        : pToDel[0]
                        ? "changeCircle"
                        : "plusCircle"
                    }
                    color={colors.white}
                  />
                </CTA>
              )}
            </CtaRow>
          )}
          <MoreBox>
            {bsValue.index === 1 && (
              <TouchableOpacity
                onPress={() =>
                  dispatch(
                    expandBS({
                      bsNm: "productToAddSelect",
                      from: "ProductToAddSelect.tsx",
                    })
                  )
                }
              >
                <Icon
                  name="more"
                  style={{ alignSelf: "center" }}
                  color={colors.inactive}
                />
              </TouchableOpacity>
            )}
          </MoreBox>
          {/* 선택된 식품사 배송비정보 */}
          {!isIncluded && (
            <ProductSelectTShippingInfo
              containerStyle={{ marginLeft: 2, marginTop: 12 }}
            />
          )}

          {/* 식품추가 버튼 */}
          <CTA
            style={{ width: "100%", marginVertical: 24 }}
            onPress={onPressAdd}
          >
            <ProductNm>{ctaText}</ProductNm>
          </CTA>
        </>
      )}
    </Box>
  );
};

export default ProductToAddSelect;

const Box = styled.View`
  width: 100%;
  padding: 0px 16px;
  border-radius: 4px;
  justify-content: center;
`;

const LRBtn = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
`;

const CtaRow = styled.View`
  flex: 1;
  flex-direction: row;
  height: 52px;
  column-gap: 8px;
  justify-content: space-between;
  align-items: center;
`;

const MoreBox = styled.View`
  height: 16px;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
`;

const InfoBtn = styled.TouchableOpacity`
  flex-direction: row;
  flex: 1;
  align-items: center;
  column-gap: 8px;
`;

const ProductNm = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  font-weight: 600;
  color: ${colors.white};
`;

const NutrText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;

const CTA = styled.TouchableOpacity`
  width: 52px;
  height: 52px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${colors.main};
  /* background-color: ${colors.main}; */
  justify-content: center;
  align-items: center;
`;
