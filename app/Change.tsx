// RN, expo
import { useCallback, useEffect, useState } from "react";

// 3rd

// doobi
import { Container, HorizontalSpace } from "@/shared/ui/styledComps";
import CtaButton from "@/shared/ui/CtaButton";
import ChangeFoodList from "@/components/screens/change/ChangeFoodList";
import ChangeSummary from "@/components/screens/change/ChangeSummary";

import { useListProduct } from "@/shared/api/queries/product";
import { ISortFilter } from "@/features/reduxSlices/sortFilterSlice";
import { IProductData } from "@/shared/api/types/product";

import { FlatList, Platform } from "react-native";
import {
  useCreateDietDetail,
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";

import { setTutorialProgress } from "@/features/reduxSlices/commonSlice";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

import colors from "@/shared/colors";
import DAlert from "@/shared/ui/DAlert";
import CommonAlertContent from "@/components/common/alert/CommonAlertContent";
import { BOTTOM_INDICATOR_IOS } from "@/shared/constants";

const FOOD_ERROR_RANGE = {
  calorie: [-20, 20],
  carb: [-5, 5],
  protein: [-5, 5],
  fat: [-3, 3],
};

const Change = () => {
  // redux
  const dispatch = useAppDispatch();
  const { isTutorialMode, tutorialProgress } = useAppSelector(
    (state) => state.common
  );
  const noProductAlert = useAppSelector(
    (state) => state.modal.modal.noProductAlert
  );

  // navigation
  const { setOptions } = useNavigation();
  const router = useRouter();
  const {
    dietNo,
    productNo,
    food: foodJString,
  }: {
    dietNo: string;
    productNo: string;
    food: string;
  } = useLocalSearchParams();
  const food = foodJString && JSON.parse(foodJString);

  // useState
  const [flatlistData, setFlatlistData] = useState<IProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<
    IProductData | undefined
  >();

  // sort, filter (not using redux-state)
  const appliedSortFilter: ISortFilter = {
    sort: {
      calorie: "",
      carb: "",
      protein: "",
      fat: "",
      price: "",
      priceCalorieCompare: "",
      priceProteinCompare: "",
    },
    filter: {
      category: "",
      selectedBtn: {
        calorie: [],
        carb: [],
        protein: [],
        fat: [],
        price: [],
      },
      nutrition: {
        calorie: [
          Number(food.calorie) + FOOD_ERROR_RANGE.calorie[0],
          Number(food.calorie) + FOOD_ERROR_RANGE.calorie[1],
        ],
        carb: [
          Number(food.carb) + FOOD_ERROR_RANGE.carb[0],
          Number(food.carb) + FOOD_ERROR_RANGE.carb[1],
        ],
        protein: [
          Number(food.protein) + FOOD_ERROR_RANGE.protein[0],
          Number(food.protein) + FOOD_ERROR_RANGE.protein[1],
        ],
        fat: [
          Number(food.fat) + FOOD_ERROR_RANGE.fat[0],
          Number(food.fat) + FOOD_ERROR_RANGE.fat[1],
        ],
      },
      price: [],
      search: "",
    },
    selectedFilter: 0,
  };

  // react-query
  const createDietDetailMutation = useCreateDietDetail();
  const deleteDietDetailMutation = useDeleteDietDetail();
  const { data: dTOData } = useListDietTotalObj();
  const dDData = dTOData?.[dietNo]?.dietDetail ?? [];
  const {
    data: listProductData,
    refetch: refetchProduct,
    isFetching: productIsFetching,
  } = useListProduct(
    {
      dietNo,
      appliedSortFilter,
    },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    const refetchAndAlert = async () => {
      const data = (await refetchProduct()).data?.filter(
        (p) => !dDData.some((dDP) => dDP.productNo === p.productNo)
      );
      if (!data) return;
      if (data && data.length === 0) {
        dispatch(openModal({ name: "noProductAlert", modalId: "Change" }));
        return;
      }
      setFlatlistData(data);
    };
    refetchAndAlert();
  }, [productNo]);

  // flatList
  const renderFoodList = useCallback(
    ({ item }: { item: IProductData }) => {
      return !dDData || productIsFetching ? (
        <></>
      ) : (
        <ChangeFoodList
          food={item}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />
      );
    },
    [dDData, selectedProduct, productIsFetching]
  );
  const extractListKey = useCallback(
    (item: IProductData) => item.productNo,
    [dDData]
  );
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 128,
      offset: 128 * index,
      index,
    }),
    [dDData]
  );

  const onCTABtnPressed = async () => {
    isTutorialMode &&
      tutorialProgress === "ChangeFood" &&
      dispatch(setTutorialProgress("AutoMenu"));
    router.back();
    if (!!selectedProduct) {
      // change food
      await deleteDietDetailMutation.mutateAsync({
        dietNo,
        productNo,
      });
      await createDietDetailMutation.mutateAsync({
        dietNo,
        food: selectedProduct,
      });
    }
  };

  const onAlertConfirm = () => {
    dispatch(closeModal({ name: "noProductAlert" }));
    if (isTutorialMode && tutorialProgress === "ChangeFood") {
      dispatch(setTutorialProgress("AutoMenu"));
      router.back();
    }
  };

  // headerTitle 설정
  useEffect(() => {
    isTutorialMode &&
      tutorialProgress === "ChangeFood" &&
      setOptions({
        headerLeft: () => <></>,
      });
  }, [isTutorialMode]);

  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;

  return (
    <Container style={{ backgroundColor: colors.white }}>
      <ChangeSummary foodToChange={food} selectedProduct={selectedProduct} />
      <HorizontalSpace height={16} />
      <FlatList
        contentContainerStyle={{
          paddingBottom: 120,
          marginTop: 8,
        }} // 숨겨지는 header의 높이만큼 margin
        data={flatlistData}
        keyExtractor={extractListKey}
        renderItem={renderFoodList}
        getItemLayout={getItemLayout}
        ItemSeparatorComponent={() => <HorizontalSpace height={8} />}
        initialNumToRender={5}
        windowSize={2}
        maxToRenderPerBatch={7}
        removeClippedSubviews={true}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        refreshing={productIsFetching}
        onRefresh={() => {
          refetchProduct();
        }}
      />
      <CtaButton
        btnStyle="active"
        btnText={!selectedProduct ? "취소" : "바꾸기"}
        style={{
          backgroundColor: colors.main,
          position: "absolute",
          bottom: insetBottom + 8,
        }}
        onPress={onCTABtnPressed}
      />
      {/* 알럿창 */}
      <DAlert
        alertShow={noProductAlert.isOpen && noProductAlert.modalId === "Change"}
        onConfirm={onAlertConfirm}
        onCancel={() => dispatch(closeModal({ name: "noProductAlert" }))}
        renderContent={() =>
          isTutorialMode && tutorialProgress === "ChangeFood" ? (
            <CommonAlertContent
              text="해당 식품과 비슷한 상품이 없어요"
              subText="지금은 다음으로 넘어갈게요!"
            />
          ) : (
            <CommonAlertContent text="해당 식품과 비슷한 상품이 없어요" />
          )
        }
        NoOfBtn={1}
      />
    </Container>
  );
};

export default Change;
