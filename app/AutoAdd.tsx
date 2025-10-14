import Foodlist from "@/components/common/mainFoodlist/Foodlist";
import {
  selectFilteredSortedProducts,
  setAvailableFoods,
  setInitialSortFilter,
} from "@/features/reduxSlices/filteredPSlice";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useListOrder } from "@/shared/api/queries/order";
import { useListProductMark } from "@/shared/api/queries/product";
import colors from "@/shared/colors";
import { AM_SELECTED_CATEGORY_IDX, SCREENWIDTH } from "@/shared/constants";
import { useAsync } from "@/shared/hooks/asyncStateHooks";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  Col,
  Container,
  HorizontalSpace,
  TextMain,
} from "@/shared/ui/styledComps";
import { getRecentProducts } from "@/shared/utils/asyncStorage";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";
import { flattenMenuArr } from "@/shared/utils/filter";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import {
  closeBSAll,
  openBS,
  setProductToAdd,
  snapBS,
} from "@/features/reduxSlices/bottomSheetSlice";
import { useIsFocused } from "@react-navigation/native";

const AutoAdd = () => {
  // navigation
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const params = useLocalSearchParams();
  const currentMenu = JSON.parse(params?.menu as string);
  const initialFilter = params?.initialSortFilter
    ? JSON.parse(params.initialSortFilter as string)
    : undefined;

  // redux
  const dispatch = useAppDispatch();
  const medianCalorie = useAppSelector((state) => state.common.medianCalorie);
  const foodGroupForAutoMenu = useAppSelector(
    (state) => state.common.foodGroupForAutoMenu
  );
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);

  const pToAdd = useAppSelector((state) => state.bottomSheet.bsData.pToAdd);
  const pToDel = useAppSelector((state) => state.bottomSheet.bsData.pToDel);
  const products = useAppSelector(selectFilteredSortedProducts);

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
          listOrderData: listOrderData || [],
          likeData: likeData || [],
        })
      );
      initialFilter && dispatch(setInitialSortFilter(initialFilter));

      return recommendedMenu;
    }
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: !!pToDel[0] ? "식품교체" : "식품추가",
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

  useEffect(() => {
    if (!isFocused) {
      dispatch(closeBSAll({ from: "AutoAdd.tsx" }));
      return;
    }
    dispatch(openBS({ bsNm: "productToAddSelect", from: "AutoAdd.tsx" }));
    pToAdd.length > 0 &&
      dispatch(
        snapBS({ bsNm: "productToAddSelect", index: 1, from: "AutoAdd.tsx" })
      );
  }, [isFocused]);

  useEffect(() => {
    return () => {
      // Formula - AutoAdd are in different Nav stacks
      dispatch(closeBSAll({ from: "AutoAdd.tsx" }));
      dispatch(setProductToAdd([]));
    };
  }, []);

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
    <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
      <Foodlist
        itemSize={(SCREENWIDTH - 32 - 8) / 2}
        products={products}
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
