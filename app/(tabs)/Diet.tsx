// RN, expo
import { useEffect, useMemo, useRef } from "react";
import { Platform, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// 3rd
// import {useIsFocused, useNavigation} from '@react-navigation/native';
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Accordion from "react-native-collapsible/Accordion";

// doobi
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useListProduct } from "@/shared/api/queries/product";

import { getMenuAcContent } from "@/shared/utils/menuAccordion";
import {
  setCurrentDiet,
  setFoodNeededArr,
  setMenuAcActive,
  setTotalFoodList,
} from "@/features/reduxSlices/commonSlice";

import { setFoodToOrder } from "@/features/reduxSlices/orderSlice";
import {
  commaToNum,
  getNutrStatus,
  sumUpDietFromDTOData,
} from "@/shared/utils/sumUp";
import { checkNoStockPAll } from "@/shared/utils/productStatusCheck";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { initialState as initialSortFilterState } from "@/features/reduxSlices/sortFilterSlice";

import { SCREENWIDTH } from "@/shared/constants";

import colors from "@/shared/colors";
import { Col, Container, HorizontalSpace } from "@/shared/ui/styledComps";
import CtaButton from "@/shared/ui/CtaButton";
import CartSummary from "@/components/screens/diet/CartSummary";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";
import { useIsFocused } from "@react-navigation/native";

const Diet = () => {
  // navigation
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const currentDietNo = useAppSelector((state) => state.common.currentDietNo);
  const menuAcActive = useAppSelector((state) => state.common.menuAcActive);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const {
    data: dTOData,
    isLoading: isDTOLoading,
    refetch: refetchDTOData,
  } = useListDietTotalObj();
  const { refetch: refetchLPData } = useListProduct(
    {
      dietNo: currentDietNo,
      appliedSortFilter: initialSortFilterState.applied,
    },
    {
      enabled: false,
    }
  );

  // useRef
  const scrollRef = useRef<ScrollView>(null);

  // useMemo
  const {
    menuNum,
    accordionContent,
    totalShippingPrice,
    priceTotal,
    isDietEmpty,
    orderBtnText,
    orderBtnStyle,
  } = useMemo(() => {
    // 비어있는 끼니 확인
    const { menuNum, priceTotal, totalShippingPrice } =
      sumUpDietFromDTOData(dTOData);
    const isDietEmpty = menuNum === 0 || priceTotal === 0;
    const orderBtnText = isDietEmpty
      ? `식단을 먼저 구성해봐요`
      : `공식 계산하기 (${commaToNum(priceTotal + totalShippingPrice)}원)`;
    const orderBtnStyle = isDietEmpty ? "inactive" : "active";

    // accordion
    const accordionContent = getMenuAcContent({
      bLData: bLData,
      dTOData,
    });

    return {
      menuNum,
      accordionContent,
      totalShippingPrice,
      priceTotal,
      isDietEmpty,
      orderBtnText,
      orderBtnStyle,
    };
  }, [dTOData]);

  useEffect(() => {
    if (!isFocused) return;
    if (!dTOData) return;
    dispatch(setMenuAcActive([]));
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    const dietNoArr = Object.keys(dTOData || {});
    const foodNeededArr = dietNoArr.map((dietNo) => {
      const nutrStatus = getNutrStatus({
        totalFoodList,
        bLData,
        dDData: dTOData[dietNo].dietDetail,
      });
      const isFoodNeeded = nutrStatus === "empty" || nutrStatus === "notEnough";
      return isFoodNeeded;
    });
    dispatch(setFoodNeededArr(foodNeededArr));
  }, [isFocused, dTOData]);

  // fn
  const getHasFoodInMenuArray = (menuIdx: number): boolean[] => {
    if (!dTOData) return [];
    return Object.keys(dTOData)
      .map((dietNo) => dTOData[dietNo].dietDetail.length > 0)
      .slice(0, menuIdx);
  };

  const calculateTargetY = (hasFoodInMenuArr: boolean[]): number => {
    let topMargin = 40;

    hasFoodInMenuArr.forEach(() => {
      topMargin += 128 + 16; // 128: menuAcInactiveHeader height, 20: rowGap
    });

    return topMargin;
  };

  const calculateScrollTarget = (menuIdx: number): number => {
    if (!dTOData) return 0;
    if (menuIdx === 0) return 32;

    const hasFoodInMenuArr = getHasFoodInMenuArray(menuIdx);
    return calculateTargetY(hasFoodInMenuArr);
  };

  const scrollToCurrentMenu = (menuIdx: number) => {
    const targetY = calculateScrollTarget(menuIdx);
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: targetY,
        animated: true,
      });
    }, 300);
  };

  const updateSections = (activeSections: number[]) => {
    if (!dTOData) return;
    const currentIdx = activeSections[0];
    const currentDietNo = Object.keys(dTOData)[currentIdx];
    const hasNoFood = dTOData[currentDietNo]?.dietDetail.length === 0;
    currentDietNo && dispatch(setCurrentDiet(currentDietNo));

    if (hasNoFood) {
      dispatch(setCurrentFMCIdx(currentIdx));
      router.push({ pathname: "/(tabs)/Formula" });
      return;
    }
    dispatch(setMenuAcActive(activeSections));
    if (activeSections.length === 0) return;

    scrollToCurrentMenu(currentIdx);
  };

  // render
  return (
    <Container
      style={{
        backgroundColor: colors.backgroundLight2,
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <HorizontalSpace height={40} />

        <Col style={{ paddingHorizontal: 16, marginBottom: 80 }}>
          {/* 끼니 아코디언 */}
          <Accordion
            activeSections={menuAcActive}
            sections={accordionContent}
            touchableComponent={TouchableOpacity}
            renderHeader={(section, _, isActive) =>
              isActive ? section.activeHeader : section.inactiveHeader
            }
            renderContent={(section) => section.content}
            renderFooter={() => <HorizontalSpace height={20} />}
            onChange={updateSections}
          />

          {/* 끼니추가 버튼 */}
          {/* {dTOData && (
            <AddMenuBtn onPress={onAddMenuPressed} dTOData={dTOData} />
          )} */}
        </Col>

        {/* 끼니 정보 요약 */}
        <CartSummary
          hasLowerShippingCta={true}
          containerStyle={{ paddingHorizontal: 16, paddingBottom: 104 }}
        />
      </ScrollView>

      {/* 주문 버튼 */}
      <CtaButton
        disabled={isDietEmpty}
        btnStyle={orderBtnStyle}
        style={{
          width: SCREENWIDTH - 32,
          alignSelf: "center",
          position: "absolute",
          bottom: Platform.OS === "ios" ? bottomTabBarHeight + 8 : 8,
        }}
        btnText={orderBtnText}
        onPress={async () => {
          const refetchedDTOData = (await refetchDTOData()).data;
          const hasNoStock = checkNoStockPAll(refetchedDTOData);
          if (hasNoStock) {
            dispatch(openModal({ name: "noStockAlert" }));
            // 전체 식품이 바뀐 경우이므로 totalFoodList도 업데이트 필요함
            const data = (await refetchLPData()).data;
            !!data && dispatch(setTotalFoodList(data));
            return;
          }
          !!dTOData && dispatch(setFoodToOrder(dTOData));
          router.push({ pathname: "/Order" });
        }}
      />
    </Container>
  );
};

export default Diet;
