// RN, expo
import { useEffect, useMemo, useRef } from "react";
import { Platform, ScrollView, TouchableOpacity } from "react-native";

// 3rd
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// doobi
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useDeleteDietAll,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import { useListOrder } from "@/shared/api/queries/order";
import { loadBaseLineData } from "@/features/reduxSlices/userInputSlice";
import colors from "@/shared/colors";
import { regroupByBuyDateAndDietNo } from "@/shared/utils/dataTransform";
import { getNutrStatus, sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { flatOrderMenuWithQty } from "@/shared/utils/screens/checklist/menuFlat";
import { closeModal, openModal } from "@/features/reduxSlices/modalSlice";

import { Container, HorizontalSpace } from "@/shared/ui/styledComps";

import CurrentDietCard from "@/components/screens/home/CurrentDietCard";
import OrderChecklistCard from "@/components/screens/home/OrderCheckListCard";
import LastOrderCard from "@/components/screens/home/LastOrderCard";
import Profile from "@/components/screens/home/Profile";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import CtaButton from "@/shared/ui/CtaButton";
import { removeAutoMenuData } from "@/shared/utils/asyncStorage";

const NewHome = () => {
  // navigation
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const { isTutorialMode, tutorialProgress, totalFoodList } = useAppSelector(
    (state) => state.common
  );
  const modalSeq = useAppSelector((state) => state.modal.modalSeq);

  // useRef (튜토리얼 식단 구성하기 버튼 위치)
  const scrollRef = useRef<ScrollView | null>(null);
  const ctaBtnRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

  // react-query
  // const { data: testErrData, refetch: throwErr } = useTestErrQuery();
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietAllMutation = useDeleteDietAll();
  const { data: orderData } = useListOrder();

  // useMemo
  // orderData regroup.
  const { orderGroupedDataFlatten, isOrderEmpty } = useMemo(() => {
    if (!orderData) return { orderGroupedDataFlatten: [], isOrderEmpty: true };
    const orderGroupedData = regroupByBuyDateAndDietNo(orderData);
    let orderGroupedDataFlatten = [];
    for (let i = 0; i < orderGroupedData.length; i++) {
      const flattenData = flatOrderMenuWithQty(orderGroupedData[i]);
      orderGroupedDataFlatten.push(flattenData);
    }
    const isOrderEmpty = orderGroupedDataFlatten.length === 0;
    return { orderGroupedDataFlatten, isOrderEmpty };
  }, [orderData]);

  // useMemo
  const { menuNum, priceTotal, totalShippingPrice, formulaStatus } =
    useMemo(() => {
      if (!dTOData) {
        return {
          menuNum: 0,
          priceTotal: 0,
          totalShippingPrice: 0,
          formulaStatus: "empty",
        };
      }

      // 총 끼니 수, 상품 수, 금액 계산
      const { menuNum, priceTotal, totalShippingPrice } =
        sumUpDietFromDTOData(dTOData);

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

      const formulaStatus =
        priceTotal === 0 ? "empty" : isAllSuccess ? "complete" : "inProgress";

      return {
        menuNum,
        priceTotal,
        totalShippingPrice,
        formulaStatus,
      };
    }, [dTOData]);

  // useEffect
  useEffect(() => {
    bLData && dispatch(loadBaseLineData(bLData));
  }, [bLData]);

  // useEffect
  // 튜토리얼 시작
  // + 스크롤 맨 위로 올리고 튜토리얼 시작 버튼 위치 저장
  useEffect(() => {
    if (!isFocused) return;
    if (!dTOData) return;
    if (!isTutorialMode || tutorialProgress !== "Start") {
      modalSeq.includes("tutorialTPSStart") &&
        dispatch(closeModal({ name: "tutorialTPSStart" }));
      return;
    }
    // 끼니 있는 경우는 모두 삭제
    const deleteAllMenuAndStartTutorial = async () => {
      await deleteDietAllMutation.mutateAsync();
    };

    const timeoutId = setTimeout(() => {
      ctaBtnRef?.current?.measure((fx, fy, width, height, px, py) => {
        const insetTop = Platform.OS === "android" ? statusBarHeight : 0;
        // paddingTop 적용시 안드로이드만 py에 padding만큼 inset이 적용됨
        // android만 paddingTop 만큼 빼주기
        dispatch(
          openModal({
            name: "tutorialTPSStart",
            values: {
              tutorialStartCTABtnPy: py,
              insetTop,
            },
          })
        );
        scrollRef?.current?.scrollTo({ y: 0, animated: true });
      });
    }, 300);

    if (Object.keys(dTOData).length !== 0) deleteAllMenuAndStartTutorial();
    return () => clearTimeout(timeoutId);
  }, [tutorialProgress, dTOData, menuNum, isFocused]);

  const ctaBtnText =
    formulaStatus === "complete"
      ? "공식 계산하기"
      : formulaStatus === "empty"
      ? "공식 만들기"
      : "공식 확인하기";

  const statusBarHeight = useSafeAreaInsets().top;

  return (
    <Container
      style={{
        backgroundColor: colors.backgroundLight,
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* firing error button */}
        {/* <CtaButton
          btnStyle="kakao"
          btnText="fire error"
          onPress={() => throwErr()}
        /> */}

        {/* 상단 프로필 */}
        <Profile />

        <HorizontalSpace height={40} />

        {/* 현재 식단 카드 (식단 있으면 구매, 없으면 식단구성버튼)*/}
        <CurrentDietCard
          ref={ctaBtnRef}
          formulaStatus={formulaStatus}
          ctaBtnText={ctaBtnText}
          menuNum={menuNum}
          priceTotal={priceTotal}
          totalShippingPrice={totalShippingPrice}
        />

        {/* 주문끼니 체크리스트*/}
        <OrderChecklistCard
          isOrderEmpty={isOrderEmpty}
          orderGroupedDataFlatten={orderGroupedDataFlatten}
        />

        {/* 마지막 주문정보 카드*/}
        <LastOrderCard
          isOrderEmpty={isOrderEmpty}
          orderGroupedDataFlatten={orderGroupedDataFlatten}
        />

        <HorizontalSpace height={40} />

        {/* <CtaButton
          btnStyle="active"
          btnText="test"
          onPress={async () => {
            await removeAutoMenuData();
          }}
          onPress={() => {
            router.push({
              pathname: "/ErrorPage",
              params: { errorCode: "999", msg: "errorTest" },
            });
          }}
        /> */}
      </ScrollView>
    </Container>
  );
};

export default NewHome;
