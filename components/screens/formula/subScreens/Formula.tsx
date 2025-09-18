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
import { FORMULA_CAROUSEL_HEIGHT, SCREENWIDTH } from "@/shared/constants";
import CarouselContent from "../carousel/CarouselContent";
import PaginationDot from "../carousel/PaginationDot";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import {
  setCurrentFMCIdx,
  setFormulaProgress,
} from "@/features/reduxSlices/formulaSlice";
import CtaButton from "@/shared/ui/CtaButton";
import { getNutrStatus, sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import EdgeInfo from "@/components/common/summaryInfo/EdgeInfo";
import DTooltip from "@/shared/ui/DTooltip";
import {
  closeBS,
  openBS,
  resetBSData,
} from "@/features/reduxSlices/bottomSheetSlice";
import Icon from "@/shared/ui/Icon";

const width = Dimensions.get("window").width;

const Formula = () => {
  // navigation
  const router = useRouter();
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const modalSeq = useAppSelector((state) => state.modal.modalSeq);
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const pToDel = useAppSelector((state) => state.bottomSheet.bsData.pToDel);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const menuArr = Object.keys(dTOData || {});

  // useMemo
  const { isAllSuccess, priceTotal } = useMemo(() => {
    if (!dTOData)
      return {
        isAllSuccess: false,
        priceTotal: 0,
      };
    const { priceTotal } = sumUpDietFromDTOData(dTOData);
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
    return { isAllSuccess, priceTotal };
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
    if (!isFocused) return;
    // console.log("Formula subscreen isFocused", isFocused);

    if (pToDel.length === 0) {
      dispatch(closeBS());
      return;
    }

    setTimeout(() => {
      dispatch(openBS("productToDelSelect"));
    }, 100);
  }, [pToDel, isFocused]);

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
          // height={FORMULA_CAROUSEL_HEIGHT + 24}
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

        {isAllSuccess && (
          <CtaButton
            btnStyle="active"
            btnText="공식 확인하기"
            style={{
              position: "absolute",
              bottom: 76,
              right: 16,
              left: 16,
              width: SCREENWIDTH - 32,
              zIndex: 0,
            }}
            onPress={() => router.push("/(tabs)/Diet")}
          />
        )}

        <EdgeInfo visible={priceTotal > 0} />
        {isAllSuccess && (
          <DTooltip
            tooltipShow={isAllSuccess}
            text="모든 근이 완료되었어요!"
            boxLeft={20}
            boxBottom={68 + 8 + 52 - 4}
            color={colors.green}
          />
        )}
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
