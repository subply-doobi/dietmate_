// RN, expo
import { useCallback, useEffect, useRef } from "react";
import { FlatList, ViewProps } from "react-native";

// 3rd

// doobi
import FoodList from "./FoodList";
import BusinessInfo from "@/components/common/businessInfo/BusinessInfo";
import CtaButton from "@/shared/ui/CtaButton";
import DTooltip from "@/shared/ui/DTooltip";

import styled from "styled-components/native";
import colors from "@/shared/colors";

import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useListProduct } from "@/shared/api/queries/product";
import { applySortFilter } from "@/features/reduxSlices/sortFilterSlice";
import { IProductData } from "@/shared/api/types/product";
import {
  FOOD_LIST_ITEM_HEIGHT,
  HOME_FILTER_HEADER_HEIGHT,
  SCREENWIDTH,
  tutorialSortFilter,
} from "@/shared/constants";
import {
  setMenuAcActive,
  setTutorialProgress,
} from "@/features/reduxSlices/commonSlice";
import { closeModal, openModal } from "@/features/reduxSlices/modalSlice";
import { usePathname, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

interface IHomeFoodListAndBtn extends ViewProps {
  scrollTop: any;
  scrollY: any;
  flatListRef: any;
}
const HomeFoodListAndBtn = ({
  scrollTop,
  scrollY,
  flatListRef,
  ...props
}: IHomeFoodListAndBtn) => {
  // navigation
  const router = useRouter();
  const pathname = usePathname();

  // redux
  const dispatch = useAppDispatch();
  const {
    currentDietNo,
    totalFoodListIsLoaded,
    isTutorialMode,
    tutorialProgress,
  } = useAppSelector((state) => state.common);
  const { applied: appliedSortFilter } = useAppSelector(
    (state) => state.sortFilter
  );

  // useRef
  const isInitialMount = useRef(true);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const dDData = dTOData?.[currentDietNo]?.dietDetail ?? [];
  const {
    data: productData,
    refetch: refetchProduct,
    isFetching: productIsFetching,
  } = useListProduct(
    {
      dietNo: currentDietNo,
      appliedSortFilter: isTutorialMode
        ? tutorialSortFilter
        : appliedSortFilter,
    },
    {
      enabled: currentDietNo ? true : false,
    }
  );

  // flatList render fn
  const renderFoodList = useCallback(
    ({ item }: { item: IProductData }) =>
      dDData ? <FoodList item={item} screen="Search" /> : <></>,
    [dDData]
  );
  const extractListKey = useCallback(
    (item: IProductData) => item.productNo,
    [productData]
  );
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: FOOD_LIST_ITEM_HEIGHT,
      offset: FOOD_LIST_ITEM_HEIGHT * index,
      index,
    }),
    [productData]
  );

  // useEffect
  // 정렬, 필터 바뀔 때마다 refetch / 스크롤 맨 위로
  useEffect(() => {
    // 화면 첫 진입때마다 refetch 되는 것 막기
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!totalFoodListIsLoaded) return;

    currentDietNo &&
      refetchProduct().then((res) => {
        if (res?.data?.length === 0) {
          dispatch(
            openModal({ name: "noProductAlert", modalId: "HomeFoodListAndBtn" })
          );
        }
      });
    scrollTop();
  }, [appliedSortFilter]);

  // etc
  // fn
  const onCTABtnPress = () => {
    if (
      isTutorialMode &&
      tutorialProgress === "SelectFood" &&
      dDData?.length === 0
    )
      return;

    if (isTutorialMode && tutorialProgress === "SelectFood") {
      dispatch(closeModal({ name: "tutorialTPS" }));
      dispatch(setTutorialProgress("AutoRemain"));
    }
    router.back();
    const idx = Object.keys(dTOData ?? []).findIndex(
      (dietNo) => dietNo === currentDietNo
    );
    !!idx && dispatch(setMenuAcActive([idx]));
  };

  const currentNumOfFoods = dDData?.length || 0;
  const isCTABtnDisAbled =
    isTutorialMode && tutorialProgress === "SelectFood" && dDData?.length === 0;

  return (
    <Container {...props}>
      {/* 식품 리스트 */}
      {productData && dDData && (
        <FlatList
          contentContainerStyle={{
            marginTop:
              isTutorialMode && tutorialProgress === "SelectFood"
                ? 16
                : HOME_FILTER_HEADER_HEIGHT,
            paddingBottom: 120,
          }} // 숨겨지는 header의 높이만큼 margin
          data={productData}
          keyExtractor={extractListKey}
          renderItem={renderFoodList}
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          windowSize={2}
          maxToRenderPerBatch={7}
          removeClippedSubviews={true}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          refreshing={productIsFetching}
          onRefresh={() => {
            if (isTutorialMode && tutorialProgress === "SelectFood") return;
            dispatch(applySortFilter());
            refetchProduct();
          }}
          progressViewOffset={HOME_FILTER_HEADER_HEIGHT}
          onScroll={(e) => {
            scrollY.setValue(
              e.nativeEvent.contentOffset.y < 0
                ? 0
                : e.nativeEvent.contentOffset.y
            );
          }}
          ref={flatListRef}
          // 하단 사업자 정보
          ListFooterComponent={() => (
            <BusinessInfo bgColor={colors.backgroundLight} />
          )}
        />
      )}

      {pathname === "/ManualAdd" && (
        <>
          {isTutorialMode && tutorialProgress === "SelectFood" && (
            <DTooltip
              tooltipShow={currentNumOfFoods >= 1}
              text="완료버튼을 눌러주세요"
              boxBottom={60}
              boxLeft={16}
            />
          )}
          <CtaButton
            btnStyle="active"
            style={{
              width: SCREENWIDTH - 32,
              position: "absolute",
              bottom: 8,
              backgroundColor: isCTABtnDisAbled ? colors.inactive : colors.main,
            }}
            disabled={isCTABtnDisAbled}
            btnText={currentNumOfFoods === 0 ? "취소" : "완료"}
            onPress={onCTABtnPress}
          />
        </>
      )}
    </Container>
  );
};

export default HomeFoodListAndBtn;

const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;
