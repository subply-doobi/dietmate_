import CartSummary from "@/components/screens/diet/CartSummary";
import MenuToMod from "@/components/screens/lowerShipping/MenuToMod";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useCreateDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import {
  showFoodChangeToast,
  showQtyChangeToast,
} from "@/shared/store/toastStore";
import CtaButton from "@/shared/ui/CtaButton";
import GuideTitle from "@/shared/ui/GuideTitle";
import { Col, Container, Icon, Row, TextMain } from "@/shared/ui/styledComps";
import { getAddDietStatusFrDTData } from "@/shared/utils/getDietAddStatus";
import {
  checkNoFoodAvailable,
  getMenusWithChangeAvailableFoods,
  MenuWithChangeAvailableFoods,
} from "@/shared/utils/screens/lowerShipping/changeAvailable";
import {
  commaToNum,
  getSortedMenuArrBySellerPrice,
  getSortedShippingPriceObj,
  ILowerShippingMenuObj,
  sumUpDietFromDTOData,
} from "@/shared/utils/sumUp";
import { useFocusEffect, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import styled from "styled-components/native";

const LowerShipping = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const toastType = useAppSelector((state) => state.lowerShipping.toastType);
  const qtyChangeMenuIdx = useAppSelector(
    (state) => state.lowerShipping.toastData.qtyChange.menuIdx
  );
  const foodChangeMenuWCA = useAppSelector(
    (state) =>
      state.lowerShipping.toastData.foodChange.menuWithChangeAvailableFoods
  );

  // react-query
  const createDietMutation = useCreateDiet();
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData, isFetching: isDTODataFetching } =
    useListDietTotalObj();

  // useMemo
  const {
    guideTitle,
    qtyModRecomendedArr,
    onlyFoodModArr,
    bothModArr,
    onlyQtyModArr,
    addDietStatus,
    totalShippingPrice,
  } = useMemo(() => {
    if (!dTOData)
      return {
        menuNum: 0,
        guideTitle: "",
        qtyModRecomendedArr: [],
        onlyFoodModArr: [],
        bothModArr: [],
        onlyQtyModArr: [],
        addDietStatus: "noData",
        totalShippingPrice: 0,
      };
    const { shippingPriceObj, menuNum, totalShippingPrice } =
      sumUpDietFromDTOData(dTOData);
    const { free, notFree } = getSortedShippingPriceObj(shippingPriceObj);
    const firstTargetSeller = notFree[0];
    const addDietStatus = getAddDietStatusFrDTData(dTOData).status;
    const targetPlatformNm = firstTargetSeller?.platformNm || "";
    const remainPrice = firstTargetSeller?.remainPrice || 0;
    const guideTitle = `"${targetPlatformNm}" 무료배송까지\n${commaToNum(
      remainPrice
    )}원 남았어요!`;

    const { included, notIncluded } = getSortedMenuArrBySellerPrice({
      dTOData,
      seller: targetPlatformNm,
    });

    // included 중 currentDietSellerPrice * 3 이 해당 식품사의 무료배송금액 보다 커지는 menu와 아닌 menu 구분
    let qtyChangeRecommended: ILowerShippingMenuObj[] = [];
    let notQtyChangeRecommended: ILowerShippingMenuObj[] = [];
    let onlyFoodChangePossible = [...notIncluded];
    included.forEach((menu) => {
      const currentDietSellerPrice = menu.currentDietSellerPrice || 0;
      if (currentDietSellerPrice * 3 >= firstTargetSeller.remainPrice) {
        qtyChangeRecommended.push(menu);
      } else {
        notQtyChangeRecommended.push(menu);
      }
    });

    // qty 변경만 가능한 경우
    // 목표식품사 식품을 가지고 있고 변경가능한 식품이 없는 경우
    let onlyQtyModArr: MenuWithChangeAvailableFoods[] = [];

    // 해당 근의 목표식품사 금액 큰 순으로, 근수를 3개 이상 구매하면 무료배송이 가능한 경우
    // 하지만 변경가능한 식품이 없다면 qty변경만 가능한 근으로 분리
    const qtyModRecomendedArr = getMenusWithChangeAvailableFoods(
      bLData,
      qtyChangeRecommended,
      totalFoodList,
      targetPlatformNm
    ).filter((menu) => {
      const noFoodAvailable = checkNoFoodAvailable(menu);
      if (!noFoodAvailable) return true;
      onlyQtyModArr.push(menu);
      return false;
    });

    // 나머지 중 근수변경, 식품변경 모두 가능한 경우 중
    // 변경가능 식품이 없는 경우는 근수 변경만 가능한 식품으로 분리
    const bothModArr = getMenusWithChangeAvailableFoods(
      bLData,
      notQtyChangeRecommended,
      totalFoodList,
      targetPlatformNm
    ).filter((menu) => {
      const noFoodAvailable = checkNoFoodAvailable(menu);
      if (!noFoodAvailable) return true;
      onlyQtyModArr.push(menu);
      return false;
    });

    // 해당 근에 목표식품사 식품이 없는 경우는 식품 교체만 가능 (근데 교체가능한 식품이 있는 근만 필터링)
    const onlyFoodModArr = getMenusWithChangeAvailableFoods(
      bLData,
      onlyFoodChangePossible,
      totalFoodList,
      targetPlatformNm
    ).filter((menu) => !checkNoFoodAvailable(menu));

    return {
      guideTitle,
      targetPlatformNm,
      qtyModRecomendedArr,
      onlyFoodModArr,
      bothModArr,
      onlyQtyModArr,
      menuNum,
      addDietStatus,
      totalShippingPrice,
    };
  }, [dTOData]);

  useFocusEffect(() => {
    if (!toastType) {
      return;
    }
    if (toastType === "foodChange") {
      showFoodChangeToast({ menuWithChangeAvailableFoods: foodChangeMenuWCA });
    }
    if (toastType === "qtyChange") {
      showQtyChangeToast({ menuIdx: qtyChangeMenuIdx });
    }
  });

  // useEffect
  useEffect(() => {
    if (totalShippingPrice === 0) {
      // 배송비 전체 무료
      router.back();
      Toast.show({
        type: "success",
        text1: "배송비가 모두 무료로 변경되었어요!",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  }, [totalShippingPrice]);

  if (isDTODataFetching)
    return (
      <Container style={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="small" color={colors.main} />
      </Container>
    );

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <GuideTitle
          title={guideTitle}
          subTitle={"무료배송 금액이 가장 가까운 순으로 도와드릴게요"}
          style={{ marginTop: 40 }}
        />

        {/* 근 추가 버튼은 최대 근수 미만 + 중복 합쳐서 10개 미만일때만*/}
        {addDietStatus === "possible" && (
          <Col style={{ marginTop: 80 }}>
            <RecommendationText>새로운 근 추가도 가능해요</RecommendationText>
            <CtaButton
              style={{ width: "99%", marginTop: 24 }}
              btnStyle="border"
              btnText={"추가하기"}
              btnContent={() => (
                <Icon
                  source={icons.appIcon}
                  size={28}
                  style={{ marginLeft: -12 }}
                />
              )}
              onPress={() => {
                createDietMutation.mutate({ setDietNo: true });
                router.back();
                dispatch(setCurrentFMCIdx(Object.keys(dTOData || {}).length));
                router.push("/(tabs)/Formula");
              }}
            />
          </Col>
        )}

        {/* 근수변경 추천 */}
        {qtyModRecomendedArr.length > 0 && (
          <Col style={{ marginTop: 80 }}>
            <RecommendationText>
              같은 근을 여러 개 구매할 수 있어요
            </RecommendationText>
          </Col>
        )}
        <MenuToMod menuArr={qtyModRecomendedArr} type="qtyRecommended" />

        {/* 둘다 가능한 경우 */}
        {bothModArr.length > 0 && (
          <Col style={{ marginTop: 80 }}>
            <RecommendationText>식품 변경을 해도 좋아요</RecommendationText>
          </Col>
        )}
        <MenuToMod menuArr={bothModArr} type="both" />

        {/* 식품 변경만 가능한 경우 */}
        {onlyFoodModArr.length > 0 && (
          <Col style={{ marginTop: 80 }}>
            <RecommendationText>식품 변경만 가능해요</RecommendationText>
          </Col>
        )}
        <MenuToMod menuArr={onlyFoodModArr} type="foodOnly" />

        {/* 근수변경만 가능한 경우 */}
        {onlyQtyModArr.length > 0 && (
          <Col style={{ marginTop: 80 }}>
            <RecommendationText>근수 변경만 가능해요</RecommendationText>
          </Col>
        )}
        <MenuToMod menuArr={onlyQtyModArr} type="qtyOnly" />

        <CartSummary containerStyle={{ marginTop: 64, paddingBottom: 120 }} />
      </ScrollView>
    </Container>
  );
};

export default LowerShipping;

const RecommendationText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
`;
