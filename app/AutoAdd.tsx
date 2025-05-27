import {
  ExcessFoodsSection,
  LikeFoodsSection,
  LowShippingSection,
  OthersSection,
  RandomProductsSection,
  RecentOpenedSection,
  RecentOrderSection,
} from "@/components/screens/autoAdd/Foodlist";
import { setAvailableFoods } from "@/features/reduxSlices/filteredPSlice";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useListOrder } from "@/shared/api/queries/order";
import { useListProductMark } from "@/shared/api/queries/product";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";
import { AM_SELECTED_CATEGORY_IDX } from "@/shared/constants";
import { useAsync } from "@/shared/hooks/asyncStateHooks";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { showProductSelectToast } from "@/shared/store/toastStore";
import CtaButton from "@/shared/ui/CtaButton";
import {
  Col,
  Container,
  HorizontalSpace,
  TextMain,
} from "@/shared/ui/styledComps";
import { getRecentProducts } from "@/shared/utils/asyncStorage";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";
import { flattenMenuArr } from "@/shared/utils/filter";
import { sumUpDietFromDTOData, sumUpNutrients } from "@/shared/utils/sumUp";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import styled from "styled-components/native";

const AutoAdd = () => {
  // redux
  const dispatch = useAppDispatch();
  const medianCalorie = useAppSelector((state) => state.common.medianCalorie);
  const foodGroupForAutoMenu = useAppSelector(
    (state) => state.common.foodGroupForAutoMenu
  );
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const selectedFood = useAppSelector(
    (state) => state.formula.autoAddSelectedFood
  );

  const currentMenu = JSON.parse(useLocalSearchParams()?.menu as string);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const { data: listOrderData } = useListOrder();
  const { data: likeData } = useListProductMark();

  // useState
  const [isDelayOver, setIsDelayOver] = useState(false);
  // const [selectedFood, setSelectedFood] = useState<IProductData | undefined>(
  //   undefined
  // );

  // useMemo
  const { shippingPriceObj, canBeExcess } = useMemo(() => {
    // 총 끼니 수, 상품 수, 금액 계산
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);
    const currentMenuCalorie = sumUpNutrients(currentMenu).cal;
    const remainCalorie = Number(bLData?.calorie) - currentMenuCalorie;
    const canBeExcess = remainCalorie < medianCalorie;

    return {
      shippingPriceObj,
      canBeExcess,
    };
  }, [dTOData]);

  // useAsyncHook
  const { isLoading, isError, isSuccess, error, execute, reset } = useAsync(
    async () => {
      if (!bLData) {
        return [];
      }

      const { recommendedMenu } = await makeAutoMenu3({
        medianCalorie,
        foodGroupForAutoMenu,
        initialMenu: currentMenu,
        baseLine: bLData,
        selectedCategoryIdx: AM_SELECTED_CATEGORY_IDX,
        priceTarget: [0, 20000],
        wantedPlatform: "",
        menuNum: 150,
      });

      const f = flattenMenuArr(recommendedMenu);
      dispatch(
        setAvailableFoods({
          totalFoodList,
          availableFoods: f,
          shippingPriceObj,
          recentProductNoArr: await getRecentProducts(),
          listOrderData: listOrderData,
          likeData: likeData,
        })
      );

      return recommendedMenu;
    }
  );

  useEffect(() => {
    if (!bLData || !dTOData || !listOrderData || !likeData) {
      return;
    }

    execute();
    const timer = setTimeout(() => {
      setIsDelayOver(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [dTOData, bLData, listOrderData, likeData]);

  useFocusEffect(() => {
    if (!selectedFood) {
      return;
    }
    showProductSelectToast();
  });

  if (isLoading || !isDelayOver) {
    return (
      <Container style={{ paddingTop: 0, alignItems: "center" }}>
        <Col style={{ top: "30%" }}>
          <LoadingText>목표 영양에 맞출 수 있는 식품을</LoadingText>
          <LoadingText>계산해서 보여드릴게요!</LoadingText>
          <HorizontalSpace height={40} />
          <ActivityIndicator size="large" color={colors.main} />
        </Col>
      </Container>
    );
  }

  return (
    <Container
      style={{
        paddingTop: 0,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 320,
        }}
      >
        <RandomProductsSection />
        <LowShippingSection />
        <RecentOpenedSection />
        <LikeFoodsSection />
        <RecentOrderSection />
        <OthersSection />
        {/* <ExcessFoodsSection /> */}
      </ScrollView>
    </Container>
  );
};

export default AutoAdd;

const LoadingText = styled(TextMain)`
  font-size: 24px;
  font-weight: bold;
  line-height: 30px;
  text-align: center;
`;
