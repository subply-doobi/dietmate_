import EdgeInfo from "@/components/common/summaryInfo/EdgeInfo";
import BottomInfo from "@/components/common/summaryInfo/EdgeInfo";
import Foodlist from "@/components/screens/autoAdd/Foodlist";
import {
  selectFilteredSortedProducts,
  setAvailableFoods,
  setLastFilteredList,
} from "@/features/reduxSlices/filteredPSlice";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useListOrder } from "@/shared/api/queries/order";
import { useListProductMark } from "@/shared/api/queries/product";
import colors from "@/shared/colors";
import { AM_SELECTED_CATEGORY_IDX, SCREENWIDTH } from "@/shared/constants";
import { useAsync } from "@/shared/hooks/asyncStateHooks";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { showProductSelectToast } from "@/shared/store/toastStore";
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
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";

const AutoAdd = () => {
  // navigation
  const navigation = useNavigation();

  // redux
  const dispatch = useAppDispatch();
  const medianCalorie = useAppSelector((state) => state.common.medianCalorie);
  const foodGroupForAutoMenu = useAppSelector(
    (state) => state.common.foodGroupForAutoMenu
  );
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const autoAddFoodForAdd = useAppSelector(
    (state) => state.formula.autoAddFoodForAdd
  );
  const autoAddFoodForChange = useAppSelector(
    (state) => state.formula.autoAddFoodForChange
  );
  const products = useAppSelector(selectFilteredSortedProducts);
  const currentMenu = JSON.parse(useLocalSearchParams()?.menu as string);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const { data: listOrderData } = useListOrder();
  const { data: likeData } = useListProductMark();

  // useState
  const [isDelayOver, setIsDelayOver] = useState(false);

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
          recentOpenedFoodsPNoArr: await getRecentProducts(),
          listOrderData: listOrderData,
          likeData: likeData,
        })
      );

      return recommendedMenu;
    }
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: !!autoAddFoodForChange ? "식품교체" : "식품추가",
    });
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
    if (!autoAddFoodForAdd) {
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
    <Container>
      <Foodlist
        title="추천 식품"
        subTitle="목표 영양에 맞춰 추천된 식품이에요."
        itemSize={(SCREENWIDTH - 32 - 8) / 2}
        products={products}
        badgeText="자동 추가"
        gap={8}
      />
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
