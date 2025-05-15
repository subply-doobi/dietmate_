// RN
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, FlatList, Platform } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import MenuSection from "@/components/common/menuSection/MenuSection";
import FlatlistHeaderComponent from "@/components/screens/search/FlatlistHeaderComponent";
import HomeFoodListAndBtn from "@/components/screens/search/HomeFoodListAndBtn";
import colors from "@/shared/colors";

import { useHeaderHeight } from "@react-navigation/elements";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListProduct } from "@/shared/api/queries/product";
import { IProductData } from "@/shared/api/types/product";
import {
  DEFAULT_BOTTOM_TAB_HEIGHT,
  tutorialSortFilter,
} from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ManualAdd 와 튜토리얼, MenuSection 끼니선택만 다름
// Search는 BottomTab에 보여져야해서 파일 분리
const Search = () => {
  // navigation
  const headerHeight = useHeaderHeight();

  // redux
  const { currentDietNo, isTutorialMode, tutorialProgress } = useAppSelector(
    (state) => state.common
  );
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
  // useEffect(() => {
  //   if (isTutorialMode && tutorialProgress === "SelectFood") {
  //     setTimeout(() => {
  //       dispatch(openModal({ name: "tutorialTPS", modalId: "Search" }));
  //     }, 200);
  //   } else {
  //     dispatch(closeModal({ name: "tutorialTPS" }));
  //   }
  // }, [isTutorialMode, tutorialProgress]);

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
