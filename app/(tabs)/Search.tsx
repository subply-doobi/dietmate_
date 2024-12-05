// RN
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, FlatList, Platform } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import FilterModalContent from "@/components/screens/search/FilterModalContent";
import MenuSection from "@/components/common/menuSection/MenuSection";
import DAlert from "@/shared/ui/DAlert";
import CommonAlertContent from "@/components/common/alert/CommonAlertContent";
import SortModalContent from "@/components/screens/search/SortModalContent";
import DTPScreen from "@/shared/ui/DTPScreen";
import DBottomSheet from "@/components/common/bottomsheet/DBottomSheet";
import FlatlistHeaderComponent from "@/components/screens/search/FlatlistHeaderComponent";
import HomeFoodListAndBtn from "@/components/screens/search/HomeFoodListAndBtn";
import DTooltip from "@/shared/ui/DTooltip";
import NutrientsProgress from "@/components/common/nutrient/NutrientsProgress";
import colors from "@/shared/colors";
import { Col } from "@/shared/ui/styledComps";

import { useHeaderHeight } from "@react-navigation/elements";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListProduct } from "@/shared/api/queries/product";
import { IProductData } from "@/shared/api/types/product";
import {
  DEFAULT_BOTTOM_TAB_HEIGHT,
  tutorialSortFilter,
} from "@/shared/constants";
import { closeModal, openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ManualAdd 와 튜토리얼, MenuSection 끼니선택만 다름
// Search는 BottomTab에 보여져야해서 파일 분리
const Search = () => {
  // navigation
  const headerHeight = useHeaderHeight();

  // redux
  const dispatch = useAppDispatch();
  const { currentDietNo, isTutorialMode, tutorialProgress } = useAppSelector(
    (state) => state.common
  );
  const noProductAlert = useAppSelector(
    (state) => state.modal.modal.noProductAlert
  );
  const tutorialTPS = useAppSelector((state) => state.modal.modal.tutorialTPS);
  const filterBS = useAppSelector((state) => state.modal.modal.filterBS);
  const sortBS = useAppSelector((state) => state.modal.modal.sortBS);
  const { applied: appliedSortFilter } = useAppSelector(
    (state) => state.sortFilter
  );

  // react-query
  const { isLoading: getBaseLineIsLoading } = useGetBaseLine(); // 미리 캐싱
  const { data: dTOData, isLoading: isDTODataLoading } = useListDietTotalObj();
  const dDData = dTOData?.[currentDietNo]?.dietDetail ?? [];
  const numOfDiet = dTOData ? Object.keys(dTOData).length : 0;
  const { data: productData } = useListProduct(
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

  // Animation
  // flatList header hide Event
  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, 100);
  const translateY = diffClamp.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
  });
  // flatlist scrollToTop
  const flatListRef = useRef<FlatList<IProductData> | null>(null);
  const scrollTop = () => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  // etc
  const currentNumOfFoods = dDData?.length || 0;
  useEffect(() => {
    if (isTutorialMode && tutorialProgress === "SelectFood") {
      setTimeout(() => {
        dispatch(openModal({ name: "tutorialTPS", modalId: "Search" }));
      }, 200);
    } else {
      dispatch(closeModal({ name: "tutorialTPS" }));
    }
  }, [isTutorialMode, tutorialProgress]);

  // render
  if (getBaseLineIsLoading || isDTODataLoading) {
    return (
      <Container style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.main} />
      </Container>
    );
  }
  const insetTop = useSafeAreaInsets().top;
  return (
    <Container
      style={{
        paddingTop: insetTop,
        paddingBottom: Platform.OS === "ios" ? DEFAULT_BOTTOM_TAB_HEIGHT : 0,
      }}
    >
      {/* 끼니선택, progressBar section */}
      <MenuSection />

      {numOfDiet === 0 ? (
        <ContentContainer></ContentContainer>
      ) : (
        <ContentContainer>
          {/* 검색결과 수 및 정렬 필터 */}
          <FlatlistHeaderComponent
            translateY={translateY}
            searchedNum={productData?.length}
          />

          {/* 상품 리스트 */}
          {!isTutorialMode && (
            <HomeFoodListAndBtn
              scrollY={scrollY}
              flatListRef={flatListRef}
              scrollTop={scrollTop}
            />
          )}
        </ContentContainer>
      )}

      {/* 정렬, 필터 모달 */}
      <DBottomSheet
        visible={filterBS.isOpen}
        closeModal={() => dispatch(closeModal({ name: "filterBS" }))}
        renderContent={() => <FilterModalContent />}
        filterHeight={514}
      />
      <DBottomSheet
        visible={sortBS.isOpen}
        closeModal={() => dispatch(closeModal({ name: "sortBS" }))}
        renderContent={() => <SortModalContent />}
        onCancel={() => {}}
      />

      {/* 알럿창 */}
      <DAlert
        alertShow={
          noProductAlert.isOpen &&
          noProductAlert.modalId === "HomeFoodListAndBtn"
        }
        onConfirm={() => dispatch(closeModal({ name: "noProductAlert" }))}
        onCancel={() => dispatch(closeModal({ name: "noProductAlert" }))}
        renderContent={() => (
          <CommonAlertContent text="해당 필터에 적용되는 상품이 없어요" />
        )}
        NoOfBtn={1}
      />
    </Container>
  );
};

export default Search;

const Container = styled.View`
  flex: 1;
`;

const ContentContainer = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;
