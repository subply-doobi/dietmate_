// RN, expo
import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Dimensions, ScrollView } from "react-native";

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
import { Col, Icon, Row, TextMain } from "@/shared/ui/styledComps";
import { FORMULA_CAROUSEL_HEIGHT, SCREENWIDTH } from "@/shared/constants";
import { icons } from "@/shared/iconSource";
import CarouselContent from "../carousel/CarouselContent";
import PaginationDot from "../carousel/PaginationDot";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useFocusEffect, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import {
  setCurrentFMCIdx,
  setFormulaProgress,
} from "@/features/reduxSlices/formulaSlice";
import CtaButton from "@/shared/ui/CtaButton";
import { getNutrStatus } from "@/shared/utils/sumUp";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import Toast from "react-native-toast-message";
import BottomInfo from "@/components/common/bottomsheet/BottomInfo";

const width = Dimensions.get("window").width;

const Formula = () => {
  // navigation
  const router = useRouter();
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);

  // const isCarouselHided = useAppSelector(
  //   (state) => state.modal.isCarouselHided
  // );
  const modalSeq = useAppSelector((state) => state.modal.modalSeq);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const menuArr = Object.keys(dTOData || {});

  // useMemo
  const isAllSuccess = useMemo(() => {
    if (!dTOData) return;
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
    return isAllSuccess;
  }, [dTOData]);

  // useRef
  const carouselRef = useRef<ICarouselInstance>(null);
  const paginationValue = useSharedValue<number>(0);

  useEffect(() => {
    if (!dTOData) return;
    const isNoMenu = Object.keys(dTOData || {}).length === 0;
    if (isNoMenu) {
      dispatch(setFormulaProgress(["SelectNumOfMenu"]));
      return;
    }
    if (currentFMCIdx > menuArr.length - 1) {
      dispatch(setCurrentFMCIdx(menuArr.length - 1));
    }
  }, [dTOData]);

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

  useEffect(() => {
    if (!dTOData) return;
    if (!isAllSuccess) return;
    if (Object.keys(dTOData).length === 0) {
      Toast.hide();
      return;
    }
    Toast.show({
      type: "success",
      text1: "공식의 모든 근이 완성되었어요!",
      text2: "장바구니에서 내 공식을 확인해보세요",
      position: "bottom",
      visibilityTime: 2500,
    });
  }, [isAllSuccess]);

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
            <Icon source={icons.more_24} size={24} />
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
          onProgressChange={paginationValue}
          renderItem={({ index }) => (
            <CarouselContent
              key={index}
              carouselRef={carouselRef}
              carouselIdx={index}
            />
          )}
        />
        <BottomInfo />

        {isAllSuccess && (
          <CtaButton
            btnStyle="active"
            btnText="공식 만들기 완료 "
            style={{
              position: "absolute",
              bottom: 8,
              right: 16,
              left: 16,
              width: SCREENWIDTH - 32,
            }}
            onPress={() => router.push("/(tabs)/Diet")}
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
