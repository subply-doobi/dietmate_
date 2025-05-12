import {
  closeModal,
  IModalName,
  openModal,
} from "@/features/reduxSlices/modalSlice";
import {
  APP_STORE_URL,
  IS_ANDROID,
  PLAY_STORE_URL,
  SCREENWIDTH,
} from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import { link } from "../linking";
import CommonAlertContent from "@/components/modal/alert/CommonAlertContent";
import { version as appVersion } from "@/package.json";
import { useGetLatestVersion } from "@/shared/api/queries/version";
import { runErrAlertActionByCode } from "../handleError";
import RequestAlertContent from "@/components/modal/alert/RequestAlertContent";
import DeleteAlertContent from "@/components/modal/alert/DeleteAlertContent";
import {
  useCreateDietCnt,
  useDeleteDiet,
  useDeleteDietAll,
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import CreateDietAlert from "@/components/screens/diet/CreateDietAlert";
import {
  setCurrentDiet,
  setFormulaProgress,
  setMenuAcActive,
  setTutorialEnd,
  setTutorialProgress,
  setTutorialStart,
} from "@/features/reduxSlices/commonSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAddDietStatusFrDTData } from "../getDietAddStatus";
import {
  initializeNotShowAgainList,
  removeToken,
  updateNotShowAgainList,
} from "../asyncStorage";
import LoadingAlertContent from "@/components/screens/diet/LoadingAlertContent";
import { useDeleteUser, useGetUser } from "@/shared/api/queries/user";
import { queryClient } from "@/shared/store/reactQueryStore";
import { initializeInput } from "@/features/reduxSlices/userInputSlice";
import { useDeleteAddress, useListAddress } from "@/shared/api/queries/address";
import { setselectedAddrIdx } from "@/features/reduxSlices/orderSlice";
import BonusAlertContent from "@/components/modal/alert/BonusAlertContent";
import CodeAlertContent from "@/components/screens/recommendCode/CodeAlertContent";
import {
  useCreateSuggestUser,
  useUpdateSuggestUser,
} from "@/shared/api/queries/suggest";
import { ViewStyle } from "react-native";
import CalGuideAlertContent from "@/components/modal/alert/CalGuideAlertContent";
import DTooltip from "@/shared/ui/DTooltip";
import CtaButton from "@/shared/ui/CtaButton";
import DSmallBtn from "@/shared/ui/DSmallBtn";
import colors from "@/shared/colors";
import { sumUpDietFromDTOData } from "../sumUp";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddMenuBtn from "@/components/screens/diet/AddMenuBtn";
import AccordionCtaBtns from "@/components/menuAccordion/AccordionCtaBtns";
import { Col, Icon } from "@/shared/ui/styledComps";
import NutrientsProgress from "@/components/common/nutrient/NutrientsProgress";
import HomeFoodListAndBtn from "@/components/screens/search/HomeFoodListAndBtn";
import { FlatList } from "react-native";
import { IProductData } from "@/shared/api/types/product";
import styled from "styled-components/native";
import { icons } from "@/shared/iconSource";
import FilterModalContent from "@/components/screens/search/FilterModalContent";
import MenuNumSelectContent from "@/components/common/cart/MenuNumSelectContent";
import React from "react";
import { Animated } from "react-native";
import SortModalContent from "@/components/screens/search/SortModalContent";

interface IModalProps {
  [key: string]: {
    // common
    contentDelay?: number;
    onCancel?: () => void;
    renderContent: () => JSX.Element;

    // Alert
    numOfBtn?: 0 | 1 | 2;
    showTopCancel?: boolean;
    confirmLabel?: string;
    style?: ViewStyle;
    onConfirm?: () => void;

    // BottomSheet
    contentHeight?: number;
  };
}

export const useModalProps = () => {
  // redux
  const dispatch = useAppDispatch();
  const { headerHeight, bottomTabBarHeight, insetTop } = useAppSelector(
    (state) => state.common.inset
  );

  const friendCd = useAppSelector((state) => state.userInput.friendCd);
  const { currentDietNo, isTutorialMode, tutorialProgress, autoMenuStatus } =
    useAppSelector((state) => state.common);
  const modalState = useAppSelector((state) => state.modal);
  const modalSeq = modalState.modalSeq;
  const currentModalNm =
    modalSeq.length > 0 ? modalSeq[modalSeq.length - 1] : "";

  // modalValues
  const dietNoToDelete =
    modalState.values.menuDeleteAlert?.dietNoToDel || ("" as string);

  // navigation
  const router = useRouter();

  // useState
  const [isCreating, setIsCreating] = useState(false);
  const [isFriendCdError, setIsFriendCdError] = useState(false);
  const [numOfCreateDiet, setNumOfCreateDiet] = useState(5);

  // react-query
  const { data: userData } = useGetUser({ enabled: false });
  const { data: latestAppVersion } = useGetLatestVersion({ enabled: false });
  const { data: dTOData, refetch: refetchDTOData } = useListDietTotalObj({
    enabled: false,
  });
  const deleteDietMutation = useDeleteDiet();
  const deleteDietAllMutation = useDeleteDietAll();
  const createDietCntMutation = useCreateDietCnt();
  const deleteDietDetailMutation = useDeleteDietDetail();
  const deleteUser = useDeleteUser();
  const deleteAddressMutation = useDeleteAddress();

  const isSuggestUserExist = Boolean(userData?.suggestFromCd);
  const createSuggestUserMutation = useCreateSuggestUser();
  const updateSuggestUserMutation = useUpdateSuggestUser();

  // useMemo
  const fixedHeaderHeight = useMemo(() => headerHeight, []);
  const {
    menuNum,
    productNum,
    priceTotal,
    totalShippingPrice,
    addDietStatus,
    addDietNAText,
    ctaBtnText,
    dDData,
    currentNumOfFoods,
  } = useMemo(() => {
    // 총 끼니 수, 상품 수, 금액 계산
    const { menuNum, productNum, priceTotal, totalShippingPrice } =
      sumUpDietFromDTOData(dTOData);
    const { status: addDietStatus, text: addDietNAText } =
      getAddDietStatusFrDTData(dTOData);

    const isDietEmpty =
      menuNum === 0 ||
      (dTOData &&
        Object.keys(dTOData).every(
          (dietNo) => dTOData[dietNo].dietDetail.length === 0
        )) ||
      false;
    const ctaBtnText = isDietEmpty ? "식단 구성하기" : "식단 구매하기";
    const dDData = dTOData?.[currentDietNo]?.dietDetail ?? [];
    const currentNumOfFoods = dDData?.length || 0;

    return {
      menuNum,
      productNum,
      priceTotal,
      totalShippingPrice,
      addDietStatus,
      addDietNAText,
      ctaBtnText,
      dDData,
      currentNumOfFoods,
    };
  }, [dTOData]);

  // useEffect
  // 상태에 따라 alert 띄우는 경우
  useEffect(() => {
    if (isTutorialMode && tutorialProgress === "Complete") {
      dispatch(openModal({ name: "tutorialCompleteAlert" }));
      return;
    }

    if (autoMenuStatus.isLoading) {
      dispatch(openModal({ name: "autoMenuLoadingAlert" }));
      return;
    }

    if (autoMenuStatus.isError) {
      dispatch(closeModal({ name: "autoMenuLoadingAlert" }));
      dispatch(openModal({ name: "autoMenuErrorAlert" }));
      return;
    }

    if (autoMenuStatus.isSuccess) {
      dispatch(closeModal({ name: "autoMenuLoadingAlert" }));
    }
  }, [isTutorialMode, tutorialProgress, autoMenuStatus]);

  // useRef
  const flatListRef = useRef<FlatList<IProductData> | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // actions
  const commonClose = useCallback((name: IModalName) => {
    dispatch(closeModal({ name }));
    // console.log("modalProps: commonClose called");
  }, []);

  // tutorialAddMenuBtnPressed
  const onTutorialAddMenuPressed = useCallback(() => {
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
  }, [dTOData, addDietStatus]);

  const scrollTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    // console.log("modalProps: scrollTop called");
  }, [flatListRef]);

  // memoized modalProps
  const { menuDeleteAlert } = useMemo(() => {
    // console.log("modalProps: menuDeleteAlert memo");
    const menuDeleteAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "삭제",
      onConfirm: () => {
        if (!dTOData) return;
        dietNoToDelete &&
          deleteDietMutation.mutate({
            dietNo: dietNoToDelete as string,
            currentDietNo,
          });
        commonClose("menuDeleteAlert");
      },
      onCancel: () => commonClose("menuDeleteAlert"),
      renderContent: () => (
        <DeleteAlertContent
          deleteText={dTOData?.[dietNoToDelete as string]?.dietSeq ?? ""}
        />
      ),
    } as IModalProps["menuDeleteAlert"];
    return {
      menuDeleteAlert,
    };
  }, [dTOData, dietNoToDelete]);

  const { menuDeleteAllAlert } = useMemo(() => {
    // console.log("modalProps: menuDeleteAllAlert memo");
    const menuDeleteAllAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "삭제",
      onConfirm: () => {
        if (!dTOData) return;
        deleteDietAllMutation.mutate();
        dispatch(setFormulaProgress(["SelectNumOfMenu"]));
        router.back();
        commonClose("menuDeleteAllAlert");
      },
      onCancel: () => commonClose("menuDeleteAllAlert"),
      renderContent: () => <DeleteAlertContent deleteText={"모든 끼니를"} />,
    } as IModalProps["menuDeleteAllAlert"];
    return { menuDeleteAllAlert };
  }, [dTOData]);

  const { menuCreateAlert } = useMemo(() => {
    // console.log("modalProps: menuCreateAlert memo");
    const menuCreateAlert = {
      numOfBtn: isCreating
        ? 0
        : isTutorialMode && tutorialProgress === "AddMenu"
        ? 1
        : 2,
      contentDelay: 0,
      confirmLabel: "추가",
      onConfirm: async () => {
        setIsCreating(true);
        await createDietCntMutation.mutateAsync({
          dietCnt: String(numOfCreateDiet),
        });
        isTutorialMode && dispatch(setTutorialProgress("AddFood"));
        setIsCreating(false);
        commonClose("menuCreateAlert");
        const refetchedDTOData = (await refetchDTOData()).data;
        const firstAddedDietNo = refetchedDTOData
          ? Object.keys(refetchedDTOData)[0]
          : "";
        dispatch(setCurrentDiet(firstAddedDietNo));
        isTutorialMode &&
          setTimeout(() => {
            dispatch(setMenuAcActive([0]));
          }, 200);
      },
      onCancel: () => commonClose("menuCreateAlert"),
      renderContent: () => (
        <CreateDietAlert
          numOfCreateDiet={numOfCreateDiet}
          setNumOfCreateDiet={setNumOfCreateDiet}
          isCreating={isCreating}
        />
      ),
    } as IModalProps["menuCreateAlert"];
    return { menuCreateAlert };
  }, [isCreating, isTutorialMode, tutorialProgress, numOfCreateDiet]);

  const { menuCreateNAAlert } = useMemo(() => {
    // console.log("modalProps: menuCreateNAAlert memo");
    const menuCreateNAAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("menuCreateNAAlert");
      },
      onCancel: () => commonClose("menuCreateNAAlert"),
      renderContent: () => <CommonAlertContent text={addDietNAText} />,
    } as IModalProps["menuCreateNAAlert"];
    return { menuCreateNAAlert };
  }, [addDietNAText]);

  const { productDeleteAlert } = useMemo(() => {
    // console.log("modalProps: fixed memo");
    const productDeleteAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "삭제",
      onConfirm: async () => {
        const productNoToDelArr =
          modalState.values?.productDeleteAlert.productNoToDelArr;
        const dietNoToProductDel =
          modalState.values?.productDeleteAlert.dietNoToProductDel || "";

        if (dTOData && productNoToDelArr) {
          const deleteMutations = productNoToDelArr.map((productNo) => {
            deleteDietDetailMutation.mutateAsync({
              dietNo: dietNoToProductDel || currentDietNo,
              productNo,
            });
          });
          await Promise.all(deleteMutations).catch((e) =>
            console.log("삭제 실패", e)
          );
        }
        commonClose("productDeleteAlert");
      },
      onCancel: () => commonClose("productDeleteAlert"),
      renderContent: () => <DeleteAlertContent deleteText={"선택한 식품을"} />,
    } as IModalProps["productDeleteAlert"];
    return { productDeleteAlert };
  }, [dTOData, modalState.values?.productDeleteAlert.productNoToDelArr]);

  const {
    autoMenuLoadingAlert,
    autoMenuErrorAlert,
    autoMenuOverPriceAlert,
    tutorialCompleteAlert,
    tutorialFoodLimitAlert,
    tutorialRestartAlert,
    myBonusGuideAlert,
    targetCalorieGuideAlert,
  } = useMemo(() => {
    // console.log("modalProps: autoMenuAlert memo");
    const autoMenuLoadingAlert = {
      numOfBtn: 0,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("autoMenuLoadingAlert");
      },
      onCancel: () => commonClose("autoMenuLoadingAlert"),
      renderContent: () => <LoadingAlertContent />,
    } as IModalProps["autoMenuLoadingAlert"];

    const autoMenuErrorAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("autoMenuErrorAlert");
      },
      onCancel: () => commonClose("autoMenuErrorAlert"),
      renderContent: () => (
        <CommonAlertContent
          text={"자동구성 오류가 발생했어요"}
          subText={"재시도 후에도 오류가 지속되면\n문의 부탁드립니다"}
        />
      ),
    } as IModalProps["autoMenuErrorAlert"];

    const autoMenuOverPriceAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("autoMenuOverPriceAlert");
      },
      onCancel: () => commonClose("autoMenuOverPriceAlert"),
      renderContent: () => (
        <CommonAlertContent
          text={"앗! 목표영양을 맞추다보니\n예산을 초과했어요"}
          subText={"다시 시도해보셔도 됩니다"}
        />
      ),
    } as IModalProps["autoMenuOverPriceAlert"];

    const tutorialCompleteAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        dispatch(setTutorialEnd());
        updateNotShowAgainList({ key: "tutorial", value: true });
        commonClose("tutorialCompleteAlert");
      },
      onCancel: () => commonClose("tutorialCompleteAlert"),
      renderContent: () => (
        <CommonAlertContent
          text={"튜토리얼이 완료되었어요\n이제 자유롭게 이용해보세요!"}
          subText={"튜토리얼은 마이페이지에서\n다시 진행할 수 있어요"}
        />
      ),
    } as IModalProps["tutorialCompleteAlert"];

    const tutorialFoodLimitAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("tutorialFoodLimitAlert");
      },
      onCancel: () => commonClose("tutorialFoodLimitAlert"),
      renderContent: () => (
        <CommonAlertContent
          text={"지금은 식품을\n하나만 추가할게요"}
          subText={"튜토리얼이 끝나면\n자유롭게 식품을 추가할 수 있어요"}
        />
      ),
    } as IModalProps["tutorialFoodLimitAlert"];

    const tutorialRestartAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: async () => {
        commonClose("tutorialRestartAlert");
        dispatch(setTutorialStart());
        await updateNotShowAgainList({ key: "tutorial", value: false });
        router.canDismiss() && router.dismissAll();
        router.replace({ pathname: "/(tabs)" });
      },
      onCancel: () => commonClose("tutorialRestartAlert"),
      renderContent: () => (
        <CommonAlertContent
          text="튜토리얼을 다시 진행할까요?"
          subText="구성한 끼니가 있다면 삭제됩니다"
        />
      ),
    } as IModalProps["tutorialRestartAlert"];

    const myBonusGuideAlert = {
      numOfBtn: 0,
      showTopCancel: true,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("myBonusGuideAlert");
      },
      onCancel: () => commonClose("myBonusGuideAlert"),
      renderContent: () => <BonusAlertContent />,
    } as IModalProps["myBonusGuideAlert"];

    const targetCalorieGuideAlert = {
      numOfBtn: 0,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("targetCalorieGuideAlert");
      },
      onCancel: () => commonClose("targetCalorieGuideAlert"),
      style: { width: SCREENWIDTH - 32 },
      renderContent: () => <CalGuideAlertContent />,
    } as IModalProps["targetCalorieGuideAlert"];

    return {
      autoMenuLoadingAlert,
      autoMenuErrorAlert,
      autoMenuOverPriceAlert,
      tutorialCompleteAlert,
      tutorialFoodLimitAlert,
      tutorialRestartAlert,
      myBonusGuideAlert,
      targetCalorieGuideAlert,
    };
  }, []);

  const { payFailAlert } = useMemo(() => {
    // console.log("modalProps: payFailAlert memo");
    const payFailAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("payFailAlert");
      },
      onCancel: () => commonClose("payFailAlert"),
      renderContent: () => (
        <CommonAlertContent
          text="결제실패"
          subText={modalState.values.payFailAlert?.payFailMsg}
        />
      ),
    } as IModalProps["payFailAlert"];
    return { payFailAlert };
  }, [modalState.values.payFailAlert?.payFailMsg]);

  const { payUrlAlert } = useMemo(() => {
    // console.log("modalProps: payUrlAlert memo");
    const payUrlAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("payUrlAlert");
      },
      onCancel: () => commonClose("payUrlAlert"),
      renderContent: () => (
        <CommonAlertContent
          text={"앱이 설치되어있는지 확인해주세요"}
          subText="문제가 계속되면 문의 바랍니다"
        />
      ),
    } as IModalProps["payUrlAlert"];
    return { payUrlAlert };
  }, []);

  const { appUpdateAlert } = useMemo(() => {
    // console.log("modalProps: appUpdateAlert memo");
    const appUpdateAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "업데이트",
      onConfirm: () => {
        IS_ANDROID ? link(PLAY_STORE_URL) : link(APP_STORE_URL);
        commonClose("appUpdateAlert");
      },
      onCancel: () => commonClose("appUpdateAlert"),
      renderContent: () => (
        <CommonAlertContent
          text="앱 업데이트가 필요합니다"
          subText={`현재버전: ${appVersion}\n최신버전: ${latestAppVersion}`}
        />
      ),
    } as IModalProps["appUpdateAlert"];
    return { appUpdateAlert };
  }, [latestAppVersion]);

  const { requestErrorAlert } = useMemo(() => {
    // console.log("modalProps: requestErrorAlert memo");
    const requestErrorAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        const errorCode = modalState.values.requestErrorAlert?.code;
        runErrAlertActionByCode(errorCode);
        commonClose("requestErrorAlert");
      },
      onCancel: () => commonClose("requestErrorAlert"),
      renderContent: () => <RequestAlertContent />,
    } as IModalProps["requestErrorAlert"];
    return { requestErrorAlert };
  }, [modalState.values.requestErrorAlert?.code]);

  const { friendCdAlert } = useMemo(() => {
    // console.log("modalProps: friendCdAlert memo");
    const friendCdAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: async () => {
        // TBD | 해당 사용자가 있는지는 아직 확인 안함
        if (friendCd.value === "") {
          setIsFriendCdError(true);
          return;
        }

        isSuggestUserExist
          ? await updateSuggestUserMutation.mutateAsync(friendCd.value)
          : await createSuggestUserMutation.mutateAsync(friendCd.value);

        commonClose("friendCdAlert");
      },
      onCancel: () => {
        setIsFriendCdError(false);
        commonClose("friendCdAlert");
      },
      renderContent: () => <CodeAlertContent isCodeError={isFriendCdError} />,
    } as IModalProps["friendCdAlert"];
    return { friendCdAlert };
  }, [friendCd.value, isSuggestUserExist]);

  const { accountWithdrawalAlert } = useMemo(() => {
    // console.log("modalProps: accountWithdrawalAlert memo");
    const accountWithdrawalAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "삭제",
      onConfirm: async () => {
        try {
          commonClose("accountWithdrawalAlert");
          deleteUser.mutate();
          queryClient.clear();
          await initializeNotShowAgainList();
          dispatch(initializeInput());
          await removeToken();
        } catch (e) {
          console.log(e);
        }
        commonClose("accountWithdrawalAlert");
      },
      onCancel: () => commonClose("accountWithdrawalAlert"),
      renderContent: () => <CommonAlertContent text="계정을 삭제합니다" />,
    } as IModalProps["accountWithdrawalAlert"];
    return { accountWithdrawalAlert };
  }, []);

  const { addressDeleteAlert } = useMemo(() => {
    // console.log("modalProps: addressDeleteAlert memo");
    const addressDeleteAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "삭제",
      onConfirm: () => {
        const { addressNoToDel, nextAddrIdx } =
          modalState.values.addressDeleteAlert;
        if (!addressNoToDel || !nextAddrIdx) return;
        deleteAddressMutation.mutate(addressNoToDel as string);
        dispatch(setselectedAddrIdx(nextAddrIdx as number));
        router.push({ pathname: "/Order" });
        commonClose("addressDeleteAlert");
      },
      onCancel: () => commonClose("addressDeleteAlert"),
      renderContent: () => (
        <CommonAlertContent text="해당 배송지를\n삭제합니다" />
      ),
    } as IModalProps["addressDeleteAlert"];
    return { addressDeleteAlert };
  }, [modalState.values.addressDeleteAlert.addressNoToDel]);

  const { noProductAlert } = useMemo(() => {
    const noProductAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        if (isTutorialMode && tutorialProgress === "ChangeFood") {
          dispatch(setTutorialProgress("AutoMenu"));
          router.back();
        }
        commonClose("noProductAlert");
      },
      onCancel: () => commonClose("noProductAlert"),
      renderContent: () => {
        if (modalState.values.noProductAlert?.screen !== "Change") {
          return (
            <CommonAlertContent text="해당 필터에 적용되는 상품이 없어요" />
          );
        }
        return isTutorialMode && tutorialProgress === "ChangeFood" ? (
          <CommonAlertContent
            text="해당 식품과 비슷한 상품이 없어요"
            subText="지금은 다음으로 넘어갈게요!"
          />
        ) : (
          <CommonAlertContent text="해당 식품과 비슷한 상품이 없어요" />
        );
      },
    } as IModalProps["noProductAlert"];
    return { noProductAlert };
  }, [
    isTutorialMode,
    tutorialProgress,
    modalState.values.noProductAlert?.screen,
  ]);

  const { changeTargetAlert, noStockAlert, orderEmptyAlert } = useMemo(() => {
    // console.log("modalProps: changeTargetAlert memo");
    const changeTargetAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        router.replace({
          pathname: "/(tabs)",
        });
        Promise.resolve().then(() => {
          router.push({
            pathname: "/UserInput",
            params: { from: "Checklist" },
          });
        });
        commonClose("changeTargetAlert");
      },
      onCancel: () => commonClose("changeTargetAlert"),
      renderContent: () => (
        <CommonAlertContent
          text={"식단을 완료했어요\n체형이나 체중변화가 있었나요?"}
          subText={"더 정확한 식단을 위해\n목표칼로리를 재설정해주세요"}
        />
      ),
    } as IModalProps["changeTargetAlert"];

    const noStockAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("noStockAlert");
      },
      onCancel: () => commonClose("noStockAlert"),
      renderContent: () => (
        <CommonAlertContent
          text={"재고없는 식품이 있어요"}
          subText={"끼니를 확인하고\n식품을 교체해주세요"}
        />
      ),
    } as IModalProps["noStockAlert"];

    const orderEmptyAlert = {
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      onConfirm: () => {
        commonClose("orderEmptyAlert");
        router.back();
      },
      onCancel: () => {
        commonClose("orderEmptyAlert");
        router.back();
      },
      renderContent: () => <CommonAlertContent text="아직 주문내역이 없어요" />,
    } as IModalProps["orderEmptyAlert"];

    return { changeTargetAlert, noStockAlert, orderEmptyAlert };
  }, []);

  // TPSTutorial
  const { tutorialTPSStart } = useMemo(() => {
    // console.log("modalProps: tutorialTPSStart memo");
    const tutorialTPSStart = {
      contentDelay: 500,
      renderContent: () => (
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
            boxTop={
              (modalState.values.tutorialTPSStart.tutorialStartCTABtnPy || 0) -
              insetTop -
              36
            }
            text="식단구성을 시작해봐요!"
            boxLeft={32}
          />
          <CtaButton
            onPress={() => {
              dispatch(setTutorialProgress("AddMenu"));
              dispatch(closeModal({ name: "tutorialTPSStart" }));
              router.push("/(tabs)/Diet");
            }}
            btnStyle="active"
            btnText={ctaBtnText}
            style={{
              width: SCREENWIDTH - 32 - 32,
              marginTop:
                (modalState.values.tutorialTPSStart.tutorialStartCTABtnPy ||
                  0) - insetTop,
            }}
          />
        </>
      ),
    } as IModalProps["tutorialTPSStart"];
    return { tutorialTPSStart };
  }, [ctaBtnText, modalState.values.tutorialTPSStart.tutorialStartCTABtnPy]);

  const { tutorialTPSAddMenu, tutorialTPSAddFood, tutorialTPSSelectFood } =
    useMemo(() => {
      // console.log("modalProps: tutorialTPSAddMenu/AddFood/SelectFood memo");
      const tutorialTPSAddMenu = {
        contentDelay: 500,
        renderContent: () => (
          <>
            <DSmallBtn
              btnText="튜토리얼 건너뛰기"
              style={{
                position: "absolute",
                bottom: 40,
                right: 0,
                backgroundColor: colors.blackOpacity70,
              }}
              onPress={() => {
                dispatch(setTutorialEnd());
                updateNotShowAgainList({ key: "tutorial", value: true });
              }}
            />
            <DTooltip
              tooltipShow={true}
              text="끼니를 먼저 추가해볼까요?"
              boxTop={headerHeight - insetTop}
            />
            {dTOData && (
              <AddMenuBtn
                dTOData={dTOData}
                onPress={onTutorialAddMenuPressed}
                style={{ marginTop: headerHeight - insetTop + 40 }}
              />
            )}
          </>
        ),
        style: { paddingHorizontal: 16 },
      } as IModalProps["tutorialTPSAddMenu"];

      const tutorialTPSAddFood = {
        contentDelay: 1000,
        renderContent: () => (
          <>
            <DSmallBtn
              btnText="튜토리얼 건너뛰기"
              style={{
                position: "absolute",
                bottom: 40,
                right: 0,
                backgroundColor: colors.blackOpacity70,
              }}
              onPress={() => {
                dispatch(setTutorialEnd());
                updateNotShowAgainList({ key: "tutorial", value: true });
              }}
            />
            <DTooltip
              tooltipShow={true}
              text="식품을 추가할 차례에요!"
              boxTop={headerHeight - insetTop + 40 + 48 + 8 + 70}
              boxLeft={8}
            />
            <AccordionCtaBtns
              style={{
                paddingHorizontal: 8,
                marginTop: headerHeight - insetTop + 40 + 48 + 8 + 70 + 40,
              }}
              dDData={dTOData?.[Object.keys(dTOData)[0]]?.dietDetail ?? []}
              dietNo={currentDietNo}
              onlyAdd={true}
            />
          </>
        ),
        style: { paddingHorizontal: 16 },
      } as IModalProps["tutorialTPSAddFood"];

      const tutorialTPSSelectFood = {
        contentDelay: 500,
        renderContent: () => (
          <>
            <Col
              style={{
                position: "absolute",
                width: "100%",
                backgroundColor: colors.white,
                paddingHorizontal: 16,
                marginTop: fixedHeaderHeight - insetTop + 40,
              }}
            >
              <NutrientsProgress dietDetailData={dDData} />
            </Col>
            <DTooltip
              tooltipShow={
                isTutorialMode &&
                tutorialProgress === "SelectFood" &&
                currentNumOfFoods === 0
              }
              text="영양성분 부분을 눌러 식품 하나를 추가해봐요"
              boxTop={fixedHeaderHeight + 40 + 70 + 8 + 140 - 40}
              boxLeft={16}
            />
            <HomeFoodListAndBtn
              style={{
                marginTop: fixedHeaderHeight + 40 + 70 + 8 + 140,
              }}
              scrollY={scrollY}
              flatListRef={flatListRef}
              scrollTop={scrollTop}
            />
          </>
        ),
      } as IModalProps["tutorialTPSSelectFood"];

      return { tutorialTPSAddMenu, tutorialTPSAddFood, tutorialTPSSelectFood };
    }, [dTOData, dDData, tutorialProgress]);

  const { tutorialTPSAutoRemain, tutorialTPSChangeFood } = useMemo(() => {
    // console.log("modalProps: tutorialTPSAutoRemain memo");
    const tutorialTPSAutoRemain = {
      contentDelay: 500,
      renderContent: () => (
        <>
          <DSmallBtn
            btnText="튜토리얼 건너뛰기"
            style={{
              position: "absolute",
              bottom: 40,
              right: 0,
              backgroundColor: colors.blackOpacity70,
            }}
            onPress={() => {
              dispatch(setTutorialEnd());
              updateNotShowAgainList({ key: "tutorial", value: true });
            }}
          />
          <Col
            style={{
              position: "absolute",
              width: "100%",
              backgroundColor: colors.white,
              paddingHorizontal: 8,
              marginTop: headerHeight - insetTop + 40 + 48 + 8,
            }}
          >
            <NutrientsProgress
              dietDetailData={
                dTOData?.[Object.keys(dTOData)[0]]?.dietDetail ?? []
              }
            />
          </Col>
          <DTooltip
            tooltipShow={true}
            text="남은 영양을 자동으로 채워볼게요!"
            boxTop={
              headerHeight -
              insetTop +
              40 +
              48 +
              8 +
              70 +
              24 +
              32 +
              24 +
              104 +
              1
            }
            boxLeft={8 + 48 + 8}
          />
          <AccordionCtaBtns
            style={{
              paddingHorizontal: 8,
              marginTop:
                headerHeight -
                insetTop +
                40 +
                48 +
                8 +
                70 +
                24 +
                32 +
                24 +
                104 +
                41,
            }}
            dDData={dTOData?.[Object.keys(dTOData)[0]]?.dietDetail ?? []}
            dietNo={currentDietNo}
            onlyAuto={true}
          />
        </>
      ),
      style: { paddingHorizontal: 16 },
    } as IModalProps["tutorialTPSAutoRemain"];

    const tutorialTPSChangeFood = {
      contentDelay: 500,
      renderContent: () => (
        <>
          <DSmallBtn
            btnText="튜토리얼 건너뛰기"
            style={{
              position: "absolute",
              bottom: 40,
              right: 0,
              backgroundColor: colors.blackOpacity70,
            }}
            onPress={() => {
              dispatch(setTutorialEnd());
              updateNotShowAgainList({ key: "tutorial", value: true });
            }}
          />
          <DTooltip
            tooltipShow={true}
            triangleRight={16}
            text="영양이 비슷한 식품으로 교체할 수 있어요"
            boxTop={
              headerHeight -
              insetTop +
              40 +
              48 +
              8 +
              70 +
              24 +
              32 +
              24 +
              104 +
              24 +
              104 -
              52 -
              40
            }
            boxRight={8}
          />
          <ChangeBtn
            onPress={() => {
              dispatch(closeModal({ name: "tutorialTPSChangeFood" }));
              router.push({
                pathname: "/Change",
                params: {
                  dietNo: currentDietNo,
                  productNo: dTOData?.[currentDietNo]?.dietDetail[1]?.productNo,
                  food:
                    JSON.stringify(dTOData?.[currentDietNo]?.dietDetail[1]) ??
                    undefined,
                },
              });
            }}
            style={{
              position: "absolute",
              top:
                headerHeight -
                insetTop +
                40 +
                48 +
                8 +
                70 +
                24 +
                32 +
                24 +
                104 +
                24 +
                104 -
                52,
              right: 8,
            }}
          >
            <Icon source={icons.changeRound_24} />
          </ChangeBtn>
        </>
      ),
      style: { paddingHorizontal: 16 },
    } as IModalProps["tutorialTPSChangeFood"];

    return { tutorialTPSAutoRemain, tutorialTPSChangeFood };
  }, [dTOData, currentDietNo]);

  const { tutorialTPSAutoMenu } = useMemo(() => {
    // console.log("modalProps: tutorialTPSAutoMenu memo");
    const tutorialTPSAutoMenu = {
      contentDelay: 1000,
      renderContent: () => (
        <>
          <DSmallBtn
            btnText="튜토리얼 건너뛰기"
            style={{
              position: "absolute",
              bottom: 40,
              right: 0,
              backgroundColor: colors.blackOpacity70,
            }}
            onPress={() => {
              dispatch(setTutorialEnd());
              updateNotShowAgainList({ key: "tutorial", value: true });
            }}
          />
          <DTooltip
            tooltipShow={true}
            text="전체 자동구성도 해볼게요"
            boxBottom={bottomTabBarHeight + 8 + 52 + 24 + 48 + 4}
            boxLeft={0}
          />
          <CtaButton
            shadow={false}
            btnStyle="active"
            style={{
              position: "absolute",
              width: SCREENWIDTH - 32,
              height: 48,
              bottom: bottomTabBarHeight + 8 + 52 + 24,
              alignSelf: "center",
            }}
            btnText={`전체 자동구성`}
            onPress={() => {
              dispatch(closeModal({ name: "tutorialTPSAutoMenu" }));
              router.push({ pathname: "/AutoMenu" });
            }}
          />
        </>
      ),
      style: { paddingHorizontal: 16 },
    } as IModalProps["tutorialTPSAutoMenu"];
    return { tutorialTPSAutoMenu };
  }, []);

  // BottomSheet
  const { filterBS, sortBS, menuNumSelectBS } = useMemo(() => {
    // console.log("modalProps: filterBS/sortBS/menuNumSelectBS memo");
    const filterBS = {
      onCancel: () => commonClose("filterBS"),
      renderContent: () => <FilterModalContent />,
      contentHeight: 514,
    } as IModalProps["filterBS"];

    const sortBS = {
      onCancel: () => commonClose("sortBS"),
      renderContent: () => <SortModalContent />,
    } as IModalProps["sortBS"];

    const menuNumSelectBS = {
      onCancel: () => commonClose("menuNumSelectBS"),
      renderContent: () => <MenuNumSelectContent />,
    } as IModalProps["menuNumSelectBS"];

    return { filterBS, sortBS, menuNumSelectBS };
  }, []);

  // modal props obj
  const modalProps = {
    // alert
    // 끼니 추가삭제, 식품 삭제
    menuDeleteAlert,
    menuDeleteAllAlert,
    menuCreateAlert,
    menuCreateNAAlert,
    productDeleteAlert,

    // 자동구성
    autoMenuLoadingAlert,
    autoMenuErrorAlert,
    autoMenuOverPriceAlert,

    // 튜토리얼
    tutorialCompleteAlert,
    tutorialFoodLimitAlert,
    tutorialRestartAlert,

    // 정보
    myBonusGuideAlert,
    targetCalorieGuideAlert,

    // 결제
    payFailAlert,
    payUrlAlert,

    // 기타
    appUpdateAlert,
    requestErrorAlert,
    friendCdAlert,
    accountWithdrawalAlert,
    addressDeleteAlert,
    noProductAlert,
    changeTargetAlert,
    noStockAlert,
    orderEmptyAlert,

    // transparentScreen (action 없음)
    tutorialTPSStart,
    tutorialTPSAddMenu,
    tutorialTPSAddFood,
    tutorialTPSSelectFood,
    tutorialTPSAutoRemain,
    tutorialTPSChangeFood,
    tutorialTPSAutoMenu,

    // BottomSheet (action 없음)
    filterBS,
    sortBS,
    menuNumSelectBS,
  };

  let numOfBtn = 0 as 0 | 1 | 2;
  let showTopCancel = false;
  let contentDelay = 0;
  let confirmLabel = "확인";
  let contentHeightBS = undefined;
  let onCancel = undefined;
  let onConfirm = undefined;
  let renderAlertContent = undefined;
  let renderBSContent = undefined;
  let style = undefined;
  let renderTPSContent = undefined;

  if (currentModalNm === "") {
    return {
      currentModalNm,
      numOfBtn,
      showTopCancel,
      contentDelay,
      confirmLabel,
      contentHeightBS,
      onCancel,
      onConfirm,
      renderAlertContent,
      renderBSContent,
      renderTPSContent,
    };
  } else if (currentModalNm.endsWith("Alert")) {
    numOfBtn = modalProps[currentModalNm]?.numOfBtn || 2;
    showTopCancel = modalProps[currentModalNm]?.showTopCancel || false;
    contentDelay = modalProps[currentModalNm]?.contentDelay || 0;
    confirmLabel = modalProps[currentModalNm]?.confirmLabel || "확인";
    onConfirm = modalProps[currentModalNm]?.onConfirm;
    onCancel = modalProps[currentModalNm]?.onCancel;
    renderAlertContent = modalProps[currentModalNm]?.renderContent;
  } else if (currentModalNm.endsWith("BS")) {
    renderBSContent = modalProps[currentModalNm]?.renderContent;
    onCancel = modalProps[currentModalNm]?.onCancel;
    contentHeightBS = modalProps[currentModalNm]?.contentHeight;
  } else {
    contentDelay = modalProps[currentModalNm]?.contentDelay || 0;
    renderTPSContent = modalProps[currentModalNm]?.renderContent;
    style = modalProps[currentModalNm]?.style;
  }

  return {
    currentModalNm,
    numOfBtn,
    showTopCancel,
    contentDelay,
    confirmLabel,
    contentHeightBS,
    style,
    onCancel,
    onConfirm,
    renderAlertContent,
    renderBSContent,
    renderTPSContent,
  };
};

const ChangeBtn = styled.TouchableOpacity`
  width: 32px;
  height: 52px;
  background-color: ${colors.white};
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-width: 1px;
  border-color: ${colors.lineLight};
`;
