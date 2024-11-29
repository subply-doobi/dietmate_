// RN
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

// 3rd
import { useIsFocused } from "@react-navigation/native";

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
import { sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { useListProduct } from "@/shared/api/queries/product";
import { updateNotShowAgainList } from "@/shared/utils/asyncStorage";
import { flatOrderMenuWithQty } from "@/shared/utils/screens/checklist/menuFlat";
import { SCREENWIDTH } from "@/shared/constants";
import { closeModal, openModal } from "@/features/reduxSlices/modalSlice";
import { queryClient } from "@/shared/store/reactQueryStore";
import { PRODUCTS } from "@/shared/api/keys";
import { initialState as initialSortFilterState } from "@/features/reduxSlices/sortFilterSlice";

import { Container, HorizontalSpace } from "@/shared/ui/styledComps";
import CtaButton from "@/shared/ui/CtaButton";
import {
  setCurrentDiet,
  setTotalFoodList,
  setTutorialEnd,
  setTutorialProgress,
} from "@/features/reduxSlices/commonSlice";

import CurrentDietCard from "@/components/screens/home/CurrentDietCard";
import OrderChecklistCard from "@/components/screens/home/OrderCheckListCard";
import LastOrderCard from "@/components/screens/home/LastOrderCard";
import Profile from "@/components/screens/home/Profile";
import DTPScreen from "@/shared/ui/DTPScreen";
import DTooltip from "@/shared/ui/DTooltip";
import DSmallBtn from "@/shared/ui/DSmallBtn";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";

const NewHome = () => {
  // navigation
  // const { navigate } = useNavigation();
  const router = useRouter();
  const isFocused = useIsFocused();

  // redux
  const dispatch = useAppDispatch();
  const {
    currentDietNo,
    totalFoodListIsLoaded,
    isTutorialMode,
    tutorialProgress,
  } = useAppSelector((state) => state.common);

  const tutorialTPS = useAppSelector((state) => state.modal.modal.tutorialTPS);

  // useRef (튜토리얼 식단 구성하기 버튼 위치)
  const scrollRef = useRef<ScrollView | null>(null);
  const ctaBtnRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  // react-query
  const { data: baseLineData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietAllMutation = useDeleteDietAll();
  const { refetch: refetchLPData } = useListProduct(
    {
      dietNo: currentDietNo,
      appliedSortFilter: initialSortFilterState.applied,
    },
    {
      enabled: false,
    }
  );
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

  // useState
  const [tutorialCtaBtnPy, setTutorialCtaBtnPy] = useState(0);

  // useMemo
  const { menuNum, productNum, priceTotal, totalShippingPrice } =
    useMemo(() => {
      // 총 끼니 수, 상품 수, 금액 계산
      const { menuNum, productNum, priceTotal, totalShippingPrice } =
        sumUpDietFromDTOData(dTOData);
      return {
        menuNum,
        productNum,
        priceTotal,
        totalShippingPrice,
      };
    }, [dTOData]);

  // useEffect
  useEffect(() => {
    baseLineData && dispatch(loadBaseLineData(baseLineData));
  }, [baseLineData]);

  // 앱 시작할 때 내가 어떤 끼니를 보고 있는지 redux에 저장해놓기 위해 필요함
  useEffect(() => {
    if (currentDietNo !== "") return;
    const initializeDiet = async () => {
      const firstDietNo = dTOData ? Object.keys(dTOData)[0] : "";
      dispatch(setCurrentDiet(firstDietNo));
    };

    initializeDiet();
  }, [dTOData]);

  // 처음 앱 켰을 때 전체 식품리스트를 redux에 저장해놓고 끼니 자동구성에 사용
  useEffect(() => {
    const loadTotalFoodList = async () => {
      if (!currentDietNo) return;
      if (totalFoodListIsLoaded) return;
      const lPData = (await refetchLPData()).data;
      if (!lPData) return;
      dispatch(setTotalFoodList(lPData));
      queryClient.removeQueries({ queryKey: [PRODUCTS, currentDietNo] });
    };

    loadTotalFoodList();
  }, [currentDietNo]);

  // useEffect
  // 튜토리얼 시작
  // + 스크롤 맨 위로 올리고 튜토리얼 시작 버튼 위치 저장
  useEffect(() => {
    if (!isFocused) return;
    if (!dTOData) return;
    if (!isTutorialMode || tutorialProgress !== "Start") {
      tutorialTPS.isOpen && dispatch(closeModal({ name: "tutorialTPS" }));
      return;
    }

    const timeoutId = setTimeout(() => {
      ctaBtnRef?.current?.measure((fx, fy, width, height, px, py) => {
        scrollRef?.current?.scrollTo({ y: 0, animated: true });
        setTutorialCtaBtnPy(py);
      });
    }, 300);

    // 끼니 있는 경우는 모두 삭제
    const deleteAllMenuAndStartTutorial = async () => {
      await deleteDietAllMutation.mutateAsync();
    };

    dispatch(openModal({ name: "tutorialTPS", modalId: "NewHome" }));
    if (Object.keys(dTOData).length !== 0) deleteAllMenuAndStartTutorial();
    return () => clearTimeout(timeoutId);
  }, [tutorialProgress, dTOData, menuNum]);

  const isDietEmpty =
    menuNum === 0 ||
    (dTOData &&
      Object.keys(dTOData).every(
        (dietNo) => dTOData[dietNo].dietDetail.length === 0
      )) ||
    false;
  const ctaBtnText = isDietEmpty ? "식단 구성하기" : "식단 구매하기";

  return (
    <Container
      style={{
        backgroundColor: colors.backgroundLight2,
        // backgroundColor: colors.backgroundLight2,
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
        {/* 상단 프로필 */}
        <Profile />

        <HorizontalSpace height={40} />

        {/* 현재 식단 카드 (식단 있으면 구매, 없으면 식단구성버튼)*/}
        <CurrentDietCard
          ref={ctaBtnRef}
          isDietEmpty={isDietEmpty}
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

        {/* 튜토리얼 */}
        <DTPScreen
          contentDelay={500}
          visible={tutorialTPS.isOpen && tutorialTPS.modalId === "NewHome"}
          renderContent={() => (
            <>
              <DSmallBtn
                btnText="튜토리얼 건너뛰기"
                style={{
                  position: "absolute",
                  bottom: 40,
                  right: 16,
                  backgroundColor: colors.blackOpacity70,
                }}
                onPress={() => {
                  dispatch(setTutorialEnd());
                  updateNotShowAgainList({ key: "tutorial", value: true });
                }}
              />
              <DTooltip
                tooltipShow={true}
                boxTop={tutorialCtaBtnPy - 36}
                text="식단구성을 시작해봐요!"
                boxLeft={32}
              />
              <CtaButton
                onPress={() => {
                  dispatch(setTutorialProgress("AddMenu"));
                  dispatch(closeModal({ name: "tutorialTPS" }));
                  // navigate("BottomTabNav", { screen: "Diet" });
                  router.push("/(tabs)/Diet");
                }}
                btnStyle="active"
                btnText={ctaBtnText}
                style={{
                  width: SCREENWIDTH - 32 - 32,
                  marginTop: tutorialCtaBtnPy,
                }}
              />
            </>
          )}
        />
      </ScrollView>
    </Container>
  );
};

export default NewHome;
