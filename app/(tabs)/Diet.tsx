// RN, expo
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// 3rd
// import {useIsFocused, useNavigation} from '@react-navigation/native';
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import Accordion from "react-native-collapsible/Accordion";
import { useIsFocused } from "@react-navigation/native";

// doobi
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useCreateDietCnt,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useListProduct } from "@/shared/api/queries/product";

import { getMenuAcContent } from "@/shared/utils/menuAccordion";
import {
  setCurrentDiet,
  setInsets,
  setMenuAcActive,
  setTotalFoodList,
} from "@/features/reduxSlices/commonSlice";

import { setFoodToOrder } from "@/features/reduxSlices/orderSlice";
import { getAddDietStatusFrDTData } from "@/shared/utils/getDietAddStatus";
import { commaToNum, sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { checkNoStockPAll } from "@/shared/utils/productStatusCheck";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { initialState as initialSortFilterState } from "@/features/reduxSlices/sortFilterSlice";

import {
  DEFAULT_BOTTOM_TAB_HEIGHT,
  IS_IOS,
  SCREENHEIGHT,
  SCREENWIDTH,
} from "@/shared/constants";

import colors from "@/shared/colors";
import { Col, Container, HorizontalSpace } from "@/shared/ui/styledComps";
import CtaButton from "@/shared/ui/CtaButton";
import AddMenuBtn from "@/components/screens/diet/AddMenuBtn";
import CartSummary from "@/components/screens/diet/CartSummary";

const Diet = () => {
  // navigation
  const router = useRouter();
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();
  const bottomTabBarHeight = useBottomTabBarHeight();

  // redux
  const dispatch = useAppDispatch();
  const {
    currentDietNo,
    menuAcActive,
    isTutorialMode,
    tutorialProgress,
    autoMenuStatus,
  } = useAppSelector((state) => state.common);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const {
    data: dTOData,
    isLoading: isDTOLoading,
    refetch: refetchDTOData,
  } = useListDietTotalObj();
  const createDietCntMutation = useCreateDietCnt();
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
  const autoMenuBtnRef =
    useRef<React.ElementRef<typeof TouchableOpacity>>(null);

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
      : `주문하기 (${commaToNum(priceTotal + totalShippingPrice)}원)`;
    const orderBtnStyle = isDietEmpty ? "inactive" : "activeDark";

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

  // etc
  const { status: addDietStatus, text: addDietNAText } =
    getAddDietStatusFrDTData(dTOData);

  // fn
  const getHasFoodInMenuArray = (menuIdx: number): boolean[] => {
    if (!dTOData) return [];
    return Object.keys(dTOData)
      .map((dietNo) => dTOData[dietNo].dietDetail.length > 0)
      .slice(0, menuIdx);
  };

  const calculateTargetY = (hasFoodInMenuArr: boolean[]): number => {
    let targetY = 40;
    const commonY = 16 + 16 + 24 + 20;

    hasFoodInMenuArr.forEach((hasFoodInMenu) => {
      targetY += hasFoodInMenu
        ? commonY + 56 + 8 // When the menu has food
        : commonY + 18 + 4; // When the menu is empty
    });

    return targetY;
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
    dispatch(setMenuAcActive(activeSections));
    if (!dTOData || activeSections.length === 0) return;
    const currentIdx = activeSections[0];
    const currentDietNo = Object.keys(dTOData)[currentIdx];
    currentDietNo && dispatch(setCurrentDiet(currentDietNo));
    scrollToCurrentMenu(currentIdx);
  };

  const onAddMenuPressed = () => {
    if (!dTOData) return;
    dispatch(closeModal({ name: "tutorialTPSAddMenu" }));
    if (addDietStatus === "possible") {
      setTimeout(() => {
        dispatch(openModal({ name: "menuCreateAlert" }));
      }, 200);
      return;
    }
    setTimeout(() => {
      dispatch(openModal({ name: "menuCreateNAAlert" }));
    }, 200);
  };

  // AutoMenu tutorial인 경우 스크롤 자동구성 버튼 위치로 내리기
  // Complete tutorial인 경우는 스크롤 맨 위로
  useEffect(() => {
    if (isTutorialMode && tutorialProgress === "Complete") {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (isTutorialMode && tutorialProgress === "AutoMenu") {
      setTimeout(
        () =>
          autoMenuBtnRef?.current?.measure((fx, fy, width, height, px, py) => {
            scrollRef.current?.scrollTo({
              y:
                py -
                SCREENHEIGHT +
                height +
                headerHeight +
                bottomTabBarHeight +
                (IS_IOS ? 0 : 41),
              animated: true,
            });
          }),
        500
      );
      return;
    }
  }, [tutorialProgress]);

  // DTP tutorial
  useEffect(() => {
    if (!isFocused) return;

    if (
      tutorialProgress === "AddMenu" ||
      tutorialProgress === "AddFood" ||
      tutorialProgress === "AutoRemain" ||
      tutorialProgress === "ChangeFood" ||
      tutorialProgress === "AutoMenu"
    ) {
      setTimeout(() => {
        dispatch(openModal({ name: `tutorialTPS${tutorialProgress}` }));
      }, 300);
      return;
    }
  }, [tutorialProgress, isFocused]);

  useEffect(() => {
    if (!isFocused) return;
    dispatch(setInsets({ headerHeight, bottomTabBarHeight }));
  }, [headerHeight, bottomTabBarHeight]);

  // render
  return (
    <Container
      style={{
        backgroundColor: colors.backgroundLight2,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: Platform.OS === "ios" ? DEFAULT_BOTTOM_TAB_HEIGHT : 0,
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
          {dTOData && (
            <AddMenuBtn onPress={onAddMenuPressed} dTOData={dTOData} />
          )}

          {/* 여러끼니 자동구성 버튼 */}
          <HorizontalSpace height={24} />
          {dTOData && Object.keys(dTOData).length > 1 && (
            <CtaButton
              ref={autoMenuBtnRef}
              btnStyle="active"
              shadow={true}
              style={{
                width: SCREENWIDTH - 32,
                alignSelf: "center",
                height: 48,
              }}
              btnText={`전체 자동구성`}
              onPress={() => {
                // dispatch(closeModal({ name: "tutorialTPS" }));
                router.push({ pathname: "/AutoMenu" });
              }}
            />
          )}
        </Col>

        {/* 끼니 정보 요약 */}
        <CartSummary />
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
