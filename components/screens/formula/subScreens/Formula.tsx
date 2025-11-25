// RN, expo
import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Dimensions } from "react-native";

// 3rd
import styled from "styled-components/native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

// doobi
import colors from "@/shared/colors";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { Row } from "@/shared/ui/styledComps";
import CarouselContent from "../carousel/CarouselContent";
import PaginationDot from "../carousel/PaginationDot";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import {
  setCurrentFMCIdx,
  setFormulaProgress,
  dequeueCarouselAction,
  resetCarouselActionQueue,
} from "@/features/reduxSlices/formulaSlice";
import { getNutrStatus } from "@/shared/utils/sumUp";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  closeBS,
  closeBSAll,
  openBS,
  resetBSData,
} from "@/features/reduxSlices/bottomSheetSlice";
import Icon from "@/shared/ui/Icon";
import { useListProduct } from "@/shared/api/queries/product";
import { initialState as initialSortFilterState } from "@/features/reduxSlices/sortFilterSlice";
import { getSummaryTotals } from "@/shared/utils/dietSummary";

const width = Dimensions.get("window").width;

const Formula = () => {
  // navigation
  const router = useRouter();
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const modalSeq = useAppSelector((state) => state.modal.modalSeq);
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const formulaProgress = useAppSelector(
    (state) => state.formula.formulaProgress
  );
  const currentFMProgress = formulaProgress[formulaProgress.length - 1];
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const bsNmArr = useAppSelector((state) => state.bottomSheet.bsNmArr);
  const pToDel = useAppSelector((state) => state.bottomSheet.bsData.pToDel);
  const carouselActionQueue = useAppSelector(
    (state) => state.formula.carouselActionQueue
  );

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData, refetch: refetchDTOData } = useListDietTotalObj();
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx] || "";
  const { refetch: refetchLPData } = useListProduct(
    {
      dietNo: currentDietNo,
      appliedSortFilter: initialSortFilterState.applied,
    },
    {
      enabled: false,
    }
  );
  const menuArr = Object.keys(dTOData || {});

  // useMemo
  const { isAllSuccess, menuNum, priceTotal } = useMemo(() => {
    if (!dTOData)
      return {
        isAllSuccess: false,
        priceTotal: 0,
      };
    const { menuNumTotal: menuNum, changedProductsTotal: priceTotal } =
      getSummaryTotals(dTOData);

    const isSuccessArr = Object.values(dTOData).map((item) => {
      const { dietDetail } = item;
      const isSuccess = getNutrStatus({
        bLData: bLData,
        dDData: dietDetail,
        totalFoodList: totalFoodList,
      });
      return isSuccess;
    });
    const isAllSuccess = isSuccessArr.every((item) => item === "satisfied");
    return { isAllSuccess, menuNum, priceTotal };
  }, [dTOData]);

  // useRef
  const carouselRef = useRef<ICarouselInstance>(null);
  const paginationValue = useSharedValue<number>(0);

  // useEffect
  useEffect(() => {
    if (!dTOData) return;
    const isNoMenu = Object.keys(dTOData || {}).length === 0;
    if (isNoMenu) {
      dispatch(setFormulaProgress(["SelectNumOfMenu"]));
      return;
    }
  }, [dTOData]);

  useEffect(() => {
    if (currentFMProgress !== "Formula") {
      return;
    }
    if (isFocused) {
      pToDel.length > 0
        ? dispatch(
            openBS({
              bsNm: "productToDelSelect",
              from: "Formula.tsx",
              option: "reset",
            })
          )
        : dispatch(
            openBS({
              bsNm: "summaryInfo",
              from: "Formula.tsx",
              option: "reset",
            })
          );
      return;
    }

    // dispatch(closeBSAll({ from: "Formula.tsx" }));
    bsNmArr.includes("summaryInfo") &&
      dispatch(closeBS({ bsNm: "summaryInfo", from: "Formula.tsx" }));

    bsNmArr.includes("productToDelSelect") &&
      dispatch(closeBS({ bsNm: "productToDelSelect", from: "Formula.tsx" }));
    return;
  }, [pToDel, isFocused]);

  // Carousel action queue handler
  useEffect(() => {
    if (!carouselRef.current) return;
    if (carouselActionQueue.length === 0) return;

    const action = carouselActionQueue[0];
    if (!action) return;

    // Prevent queue overflow
    if (carouselActionQueue.length > 4) {
      dispatch(resetCarouselActionQueue());
      return;
    }

    switch (action.type) {
      case "scrollTo": {
        carouselRef.current.scrollTo({
          count: action.index - paginationValue.value,
          animated: action.animated !== false,
        });
        break;
      }
      case "scrollToNext": {
        carouselRef.current.next({ animated: action.animated !== false });
        break;
      }
      case "scrollToPrev": {
        carouselRef.current.prev({ animated: action.animated !== false });
        break;
      }
    }

    // Dequeue the action immediately since carousel actions don't have completion callbacks
    dispatch(dequeueCarouselAction());
  }, [dispatch, carouselActionQueue, paginationValue.value]);

  // etc
  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - paginationValue.value,
      animated: true,
    });
  };

  const isCarouselIdxExceed = menuArr.length - 1 < currentFMCIdx;
  const isCarouselHided = modalSeq.length > 0;

  if (!isFocused || isCarouselIdxExceed || isCarouselHided) {
    return (
      <Container style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} color={colors.main} />
      </Container>
    );
  } else {
    return (
      <Container>
        <Row
          style={{
            alignSelf: "center",
            marginTop: 24,
            justifyContent: "center",
            columnGap: 8,
            width: "100%",
          }}
        >
          <Pagination.Custom
            progress={paginationValue}
            data={menuArr}
            dotStyle={{
              width: 40,
              height: 26,
              borderRadius: 6,
              // borderWidth: 1,
              // borderColor: colors.lineLight,
              // backgroundColor: colors.white,
              alignSelf: "flex-end",
            }}
            activeDotStyle={{
              width: 48,
              height: 32,
              // borderRadius: 8,
              backgroundColor: colors.white,
            }}
            renderItem={(_, index) => <PaginationDot index={index} />}
            containerStyle={{
              gap: 4,
            }}
            onPress={onPressPagination}
          />
          <MoreBtn onPress={() => router.push("/FormulaMore")}>
            <Icon name="more" color={colors.textSub} />
          </MoreBtn>
        </Row>
        <Carousel
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxAdjacentItemScale: 0.85,
            parallaxScrollingOffset: 76,
          }}
          defaultIndex={currentFMCIdx}
          onConfigurePanGesture={(gestureChain) =>
            gestureChain.activeOffsetX([-20, 20])
          }
          ref={carouselRef}
          width={width}
          // height={formulaCarouselHeight}
          data={menuArr}
          loop={false}
          onSnapToItem={(index) => {
            dispatch(setCurrentFMCIdx(index));
          }}
          onScrollStart={() => pToDel.length > 0 && dispatch(resetBSData())}
          onProgressChange={paginationValue}
          renderItem={({ index }) => (
            <CarouselContent
              key={index}
              carouselRef={carouselRef}
              carouselIdx={index}
            />
          )}
        />
      </Container>
    );
  }
};

export default Formula;

const Container = styled.View`
  flex: 1;
  background-color: ${colors.backgroundLight2};
`;

const MoreBtn = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  background-color: ${colors.white};

  border-radius: 8px;
  border-width: 1px;
  border-color: ${colors.lineLight};

  align-items: center;
  justify-content: center;
`;
