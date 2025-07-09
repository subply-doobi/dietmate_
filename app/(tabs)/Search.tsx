// RN
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, FlatList, Platform } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import colors from "@/shared/colors";

import { useHeaderHeight } from "@react-navigation/elements";
import { useCreateDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useListProduct,
  useListProductMark,
} from "@/shared/api/queries/product";
import {
  DEFAULT_BOTTOM_TAB_HEIGHT,
  SCREENWIDTH,
  tutorialSortFilter,
} from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Col, Container } from "@/shared/ui/styledComps";
import Foodlist from "@/components/common/mainFoodlist/Foodlist";
import {
  selectFilteredSortedProducts,
  setAvailableFoods,
} from "@/features/reduxSlices/filteredPSlice";
import { getRecentProducts } from "@/shared/utils/asyncStorage";
import { useListOrder } from "@/shared/api/queries/order";
import { useFocusEffect, usePathname } from "expo-router";
import { setTotalFoodList } from "@/features/reduxSlices/commonSlice";
import { useIsFocused } from "@react-navigation/native";
import { setProductToDel } from "@/features/reduxSlices/bottomSheetSlice";

const Search = () => {
  // navigation
  const pathName = usePathname();
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const totalFoodListIsLoaded = useAppSelector(
    (state) => state.common.totalFoodListIsLoaded
  );
  const products = useAppSelector(selectFilteredSortedProducts);

  // react-query
  const { isLoading: getBaseLineIsLoading } = useGetBaseLine(); // 미리 캐싱
  const { data: dTOData, isLoading: isDTODataLoading } = useListDietTotalObj();
  const createDietMutation = useCreateDiet();
  const { data: listOrderData } = useListOrder();
  const { data: likeData } = useListProductMark();
  const numOfDiet = Object.keys(dTOData || {}).length;

  // render
  if (getBaseLineIsLoading || isDTODataLoading) {
    return (
      <Container style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.main} />
      </Container>
    );
  }

  useEffect(() => {
    if (!isFocused) return;
    dispatch(setProductToDel([]));
  }, [isFocused]);

  useEffect(() => {
    if (!totalFoodListIsLoaded) return;
    const loadProducts = async () => {
      dispatch(
        setAvailableFoods({
          screenNm: pathName,
          totalFoodList,
          availableFoods: [],
          recentOpenedFoodsPNoArr: await getRecentProducts(),
          listOrderData: listOrderData || [],
          likeData: likeData || [],
        })
      );
    };
    loadProducts();
  }, [totalFoodListIsLoaded, totalFoodList.length]);

  useEffect(() => {
    if (!isFocused) return;
    if (numOfDiet > 0) return;
    createDietMutation.mutate({});
  }, [numOfDiet]);

  return totalFoodListIsLoaded ? (
    <Container style={{ paddingHorizontal: 0 }}>
      <Col>
        <Foodlist
          itemSize={(SCREENWIDTH - 32 - 8) / 2}
          products={products}
          gap={8}
        />
      </Col>
    </Container>
  ) : (
    <Container style={{ justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={colors.main} size={"small"} />
    </Container>
  );
};

export default Search;
