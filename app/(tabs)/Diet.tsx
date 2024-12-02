// RN, expo
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
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
  setAutoMenuStatus,
  setCurrentDiet,
  setMenuAcActive,
  setTotalFoodList,
  setTutorialEnd,
  setTutorialProgress,
} from "@/features/reduxSlices/commonSlice";

import { setFoodToOrder } from "@/features/reduxSlices/orderSlice";
import { getAddDietStatusFrDTData } from "@/shared/utils/getDietAddStatus";
import { commaToNum, sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { updateNotShowAgainList } from "@/shared/utils/asyncStorage";
import { checkNoStockPAll } from "@/shared/utils/productStatusCheck";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { initialState as initialSortFilterState } from "@/features/reduxSlices/sortFilterSlice";

import {
  renderAlertContent,
  renderDTPContent,
} from "@/shared/utils/screens/diet/modalContent";

import {
  IS_ANDROID,
  IS_IOS,
  SCREENHEIGHT,
  SCREENWIDTH,
} from "@/shared/constants";

import colors from "@/shared/colors";
import { Col, Container, HorizontalSpace } from "@/shared/ui/styledComps";
import DBottomSheet from "@/components/common/bottomsheet/DBottomSheet";
import CtaButton from "@/shared/ui/CtaButton";
import AddMenuBtn from "@/components/screens/diet/AddMenuBtn";
import CartSummary from "@/components/screens/diet/CartSummary";
import MenuNumSelectContent from "@/components/common/cart/MenuNumSelectContent";
import DAlert from "@/shared/ui/DAlert";
import DTPScreen from "@/shared/ui/DTPScreen";

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
  const {
    menuCreateAlert,
    menuCreateNAAlert,
    noStockAlert,
    autoMenuOverPriceAlert,
    tutorialTPS,
    menuNumSelectBS,
  } = useAppSelector((state) => state.modal.modal);

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

  // useState
  const [forceModalQuit, setForceModalQuit] = useState(false);
  const [numOfCreateDiet, setNumOfCreateDiet] = useState(5);
  const [isCreating, setIsCreating] = useState(false);

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
  const updateSections = (activeSections: number[]) => {
    dispatch(setMenuAcActive(activeSections));
    if (!dTOData || activeSections.length === 0) return;
    const currentIdx = activeSections[0];
    const currentDietNo = Object.keys(dTOData)[currentIdx];
    currentDietNo && dispatch(setCurrentDiet(currentDietNo));
  };

  const onAddCreatePressed = () => {
    if (!dTOData) return;
    // dispatch(setTutorialProgress(''));
    setIsCreating(false);
    dispatch(closeModal({ name: "tutorialTPS" }));
    if (addDietStatus === "possible") {
      menuNum < 5 ? setNumOfCreateDiet(5 - menuNum) : setNumOfCreateDiet(1);
      dispatch(openModal({ name: "menuCreateAlert" }));
      return;
    }
    dispatch(openModal({ name: "menuCreateNAAlert" }));
  };

  const onCreateDiet = async () => {
    setIsCreating(true);

    await createDietCntMutation.mutateAsync({
      dietCnt: String(numOfCreateDiet),
    });

    isTutorialMode && dispatch(setTutorialProgress("AddFood"));

    setIsCreating(false);
    dispatch(closeModal({ name: "menuCreateAlert" }));

    const refetchedDTOData = (await refetchDTOData()).data;
    const firstAddedDietNo = refetchedDTOData
      ? Object.keys(refetchedDTOData)[0]
      : "";
    dispatch(setCurrentDiet(firstAddedDietNo));

    isTutorialMode &&
      setTimeout(() => {
        dispatch(setMenuAcActive([0]));
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
              y: IS_ANDROID
                ? py -
                  (SCREENHEIGHT -
                    (height + headerHeight + bottomTabBarHeight + 40 + 60))
                : IS_IOS
                ? py - (SCREENHEIGHT - (height + bottomTabBarHeight + 40 + 44))
                : 0,
              animated: true,
            });
          }),
        1500
      );
      return;
    }
  }, [tutorialProgress]);

  useEffect(() => {
    if (!isFocused) {
      setForceModalQuit(true);
      return;
    }
    setForceModalQuit(false);
  }, [isFocused]);

  // ███    ███  ██████  ██████   █████  ██
  // ████  ████ ██    ██ ██   ██ ██   ██ ██
  // ██ ████ ██ ██    ██ ██   ██ ███████ ██
  // ██  ██  ██ ██    ██ ██   ██ ██   ██ ██
  // ██      ██  ██████  ██████  ██   ██ ███████

  // alert state
  const alertState = menuCreateAlert.isOpen
    ? "createDiet"
    : menuCreateNAAlert.isOpen
    ? "createDietNA"
    : autoMenuStatus.isLoading
    ? "autoMenuLoading"
    : autoMenuStatus.isError
    ? "autoMenuError"
    : isTutorialMode && tutorialProgress === "Complete"
    ? "tutorialComplete"
    : autoMenuOverPriceAlert.isOpen
    ? "autoMenuOverPrice"
    : noStockAlert.isOpen
    ? "noStock"
    : "";
  const alertShow = !forceModalQuit && alertState !== "";
  // alert confirm fn
  const alertConfirmFn: { [key: string]: Function } = {
    createDiet: async () => await onCreateDiet(),
    createDietNA: () => dispatch(closeModal({ name: "menuCreateNAAlert" })),
    autoMenuLoading: () => {},
    autoMenuError: () => dispatch(setAutoMenuStatus({ isError: false })),
    tutorialComplete: () => {
      dispatch(setTutorialEnd());
      updateNotShowAgainList({ key: "tutorial", value: true });
    },
    noStock: () => dispatch(closeModal({ name: "noStockAlert" })),
    autoMenuOverPrice: () =>
      dispatch(closeModal({ name: "autoMenuOverPriceAlert" })),
  };
  // alert cancel fn
  const alertCancelFn: { [key: string]: Function } = {
    createDiet: () => dispatch(closeModal({ name: "menuCreateAlert" })),
    createDietNA: () => dispatch(closeModal({ name: "menuCreateNAAlert" })),
    autoMenuLoading: () => {},
    autoMenuError: () => dispatch(setAutoMenuStatus({ isError: false })),
    tutorialComplete: () => {},
    noStock: () => dispatch(closeModal({ name: "noStockAlert" })),
    autoMenuOverPrice: () =>
      dispatch(closeModal({ name: "autoMenuOverPriceAlert" })),
  };
  const alertNumOfBtn: { [key: string]: 0 | 1 | 2 } = {
    createDiet: isCreating
      ? 0
      : isTutorialMode && tutorialProgress === "AddMenu"
      ? 1
      : 2,
    createDietNA: 1,
    autoMenuLoading: 0,
    autoMenuError: 1,
    tutorialComplete: 1,
    noStock: 1,
    autoMenuOverPrice: 1,
  };

  const alertDelay = alertState === "tutorialComplete" ? 1000 : 0;
  const alertConfirmLabel = alertState === "createDiet" ? "추가" : "확인";

  // DTP state
  useEffect(() => {
    if (!isFocused) {
      tutorialTPS.isOpen && dispatch(closeModal({ name: "tutorialTPS" }));
      return;
    }
    if (
      !forceModalQuit &&
      !alertShow &&
      isTutorialMode &&
      (tutorialProgress === "AddMenu" ||
        tutorialProgress === "AddFood" ||
        tutorialProgress === "AutoRemain" ||
        tutorialProgress === "ChangeFood" ||
        tutorialProgress === "AutoMenu")
    ) {
      setTimeout(() => {
        dispatch(openModal({ name: "tutorialTPS", modalId: "Diet" }));
      }, 100);
      return;
    }
    tutorialTPS.isOpen && dispatch(closeModal({ name: "tutorialTPS" }));
  }, [tutorialProgress, alertShow, forceModalQuit, isFocused]);

  const dtpDeley: { [key: string]: number } = {
    AddMenu: 500,
    AddFood: 1000,
    AutoRemain: 500,
    ChangeFood: 500,
    AutoMenu: 2000,
  };
  const dtpAction: { [key: string]: () => void } = {
    AddMenu: () => {
      onAddCreatePressed();
    },
    AddFood: () => setForceModalQuit(true),
    AutoRemain: () => {},
    ChangeFood: () => {
      router.push({
        pathname: "/Change",
        params: {
          dietNo: currentDietNo,
          productNo:
            JSON.stringify(
              dTOData?.[currentDietNo]?.dietDetail[1]?.productNo
            ) ?? "",
          food:
            JSON.stringify(dTOData?.[currentDietNo]?.dietDetail[1]) ??
            undefined,
        },
      });
    },
    AutoMenu: () => {
      router.push({ pathname: "/AutoMenu" });
    },
  };

  console.log("Diet: currentDietNO", currentDietNo);

  // render
  return (
    <Container
      style={{
        backgroundColor: colors.backgroundLight2,
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
          {dTOData && (
            <AddMenuBtn onPress={onAddCreatePressed} dTOData={dTOData} />
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
                dispatch(closeModal({ name: "tutorialTPS" }));
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
          bottom: 8,
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

      {/* 끼니 수량 조절용 BottomSheet */}
      <DBottomSheet
        visible={menuNumSelectBS.isOpen}
        closeModal={() => dispatch(closeModal({ name: "menuNumSelectBS" }))}
        renderContent={() => <MenuNumSelectContent />}
      />

      {/* 알럿 */}
      <DAlert
        contentDelay={alertDelay}
        style={{ width: 280 }}
        alertShow={alertShow}
        onCancel={alertCancelFn[alertState]}
        onConfirm={alertConfirmFn[alertState]}
        confirmLabel={alertConfirmLabel}
        NoOfBtn={alertNumOfBtn[alertState]}
        renderContent={() =>
          renderAlertContent[alertState] &&
          renderAlertContent[alertState]({
            numOfCreateDiet,
            setNumOfCreateDiet,
            isCreating,
            addDietNAText,
          })
        }
      />

      {/* DTP (튜토리얼)*/}
      <DTPScreen
        contentDelay={dtpDeley[tutorialProgress] || 0}
        style={{ paddingHorizontal: 16 }}
        visible={tutorialTPS.isOpen && tutorialTPS.modalId === "Diet"}
        renderContent={() =>
          renderDTPContent[tutorialProgress] &&
          renderDTPContent[tutorialProgress]({
            fn: dtpAction[tutorialProgress],
            headerHeight,
            bottomTabBarHeight,
            dTOData: dTOData || {},
            currentDietNo,
          })
        }
      />
    </Container>
  );
};

export default Diet;
