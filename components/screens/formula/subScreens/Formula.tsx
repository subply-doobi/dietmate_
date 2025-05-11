// RN, expo
import { SetStateAction, useRef } from "react";
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
import { IFormulaPageNm } from "@/shared/utils/screens/formula/contentByPages";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { Icon, Row } from "@/shared/ui/styledComps";
import { FORMULA_CAROUSEL_HEIGHT } from "@/shared/constants";
import { icons } from "@/shared/iconSource";
import { IDietTotalObjData } from "@/shared/api/types/diet";
import CarouselContent from "../carousel/CarouselContent";
import { setCurrentFMCIdx } from "@/features/reduxSlices/commonSlice";
import PaginationDot from "../carousel/PaginationDot";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useFocusEffect } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

const width = Dimensions.get("window").width;

const findFirstTargetIdx = (dTOData?: IDietTotalObjData) => {
  if (!dTOData) return 0;
  const dietNoArr = Object.keys(dTOData);
  const menuLengthList = dietNoArr.map(
    (dietNo) => dTOData[dietNo].dietDetail.length
  );
  const firstTargetIdx = menuLengthList.findIndex((m: number) => m === 0);
  if (firstTargetIdx === -1) {
    return menuLengthList.length - 1;
  }
  return firstTargetIdx;
};

const Formula = ({
  setProgress,
}: {
  setProgress: React.Dispatch<SetStateAction<string[] | IFormulaPageNm[]>>;
}) => {
  // navigation
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const currentFMCIdx = useAppSelector((state) => state.common.currentFMCIdx);
  // const isCarouselHided = useAppSelector(
  //   (state) => state.modal.isCarouselHided
  // );
  const modalSeq = useAppSelector((state) => state.modal.modalSeq);
  const isCarouselHided = modalSeq.length > 0;

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const menuArr = Object.keys(dTOData || {});

  // useRef
  const carouselRef = useRef<ICarouselInstance>(null);
  const paginationValue = useSharedValue<number>(0);

  // useState

  // useEffect
  useFocusEffect(() => {
    carouselRef.current?.scrollTo({
      index: currentFMCIdx,
      animated: true,
    });
  });

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

  if (isCarouselHided || !isFocused) {
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
            marginTop: 24,
            alignSelf: "center",
            columnGap: 8,
            justifyContent: "center",
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
              borderWidth: 1,
              borderColor: colors.lineLight,
              backgroundColor: colors.white,
              alignSelf: "flex-end",
            }}
            activeDotStyle={{
              width: 48,
              height: 32,
              borderRadius: 8,
              backgroundColor: colors.white,
            }}
            renderItem={(_, index) => <PaginationDot index={index} />}
            containerStyle={{
              gap: 4,
            }}
            onPress={onPressPagination}
          />
          <MoreBtn onPress={() => console.log("more!!")}>
            <Icon source={icons.more_24} size={24} />
          </MoreBtn>
        </Row>
        <Carousel
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxAdjacentItemScale: 0.9,
            parallaxScrollingOffset: 65,
          }}
          onConfigurePanGesture={(gestureChain) =>
            gestureChain.activeOffsetX([-20, 20])
          }
          ref={carouselRef}
          width={width}
          height={FORMULA_CAROUSEL_HEIGHT + 24}
          data={menuArr}
          loop={false}
          onSnapToItem={(index) => {
            dispatch(setCurrentFMCIdx(index));
          }}
          onProgressChange={paginationValue}
          renderItem={({ index }) => (
            <CarouselContent
              key={index}
              setProgress={setProgress}
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
