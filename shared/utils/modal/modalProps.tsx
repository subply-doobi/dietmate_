import React from "react";
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
import {
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
import { useDeleteAddress } from "@/shared/api/queries/address";
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
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";
import { getSummaryTotals } from "../dietSummary";

interface IModalProps {
  [key: string]: {
    // common
    contentDelay?: number;
    onCancel?: () => void;
    renderContent: () => React.JSX.Element;

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
  const { isTutorialMode, tutorialProgress } = useAppSelector(
    (state) => state.common
  );
  const modalState = useAppSelector((state) => state.modal);
  const modalSeq = modalState.modalSeq;
  const currentModalNm =
    modalSeq.length > 0 ? modalSeq[modalSeq.length - 1] : "";

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
  const { ctaBtnText } = useMemo(() => {
    // 총 끼니 수, 상품 수, 금액 계산
    const {
      menuNumTotal: menuNum,
      productNumTotal: productNum,
      changedProductsTotal: priceTotal,
      changedShippingTotal: totalShippingPrice,
    } = getSummaryTotals(dTOData);
    const {
      status: addDietStatus,
      text: addDietNAText,
      subText: addDietNASubtext,
    } = getAddDietStatusFrDTData(dTOData);

    const isDietEmpty =
      menuNum === 0 ||
      (dTOData &&
        Object.keys(dTOData).every(
          (dietNo) => dTOData[dietNo].dietDetail.length === 0
        )) ||
      false;
    const ctaBtnText = isDietEmpty ? "공식 만들기" : "공식 계산하기";

    return {
      menuNum,
      productNum,
      priceTotal,
      totalShippingPrice,
      addDietStatus,
      addDietNAText,
      addDietNASubtext,
      ctaBtnText,
    };
  }, [dTOData]);

  // useEffect
  // 상태에 따라 alert 띄우는 경우
  useEffect(() => {
    if (isTutorialMode && tutorialProgress === "Complete") {
      dispatch(openModal({ name: "tutorialCompleteAlert" }));
      return;
    }
  }, [isTutorialMode, tutorialProgress]);

  // actions
  const commonClose = useCallback((name: IModalName) => {
    dispatch(closeModal({ name }));
    // console.log("modalProps: commonClose called");
  }, []);

  // memoized modalProps
  const { menuDeleteAllAlert } = useMemo(() => {
    // console.log("modalProps: menuDeleteAllAlert memo");
    const menuDeleteAllAlert = {
      numOfBtn: 2,
      contentDelay: 0,
      confirmLabel: "삭제",
      onConfirm: () => {
        if (!dTOData) return;
        commonClose("menuDeleteAllAlert");
        dispatch(setFormulaProgress(["SelectNumOfMenu"]));
        deleteDietAllMutation.mutate();
        setTimeout(() => {
          router.back();
        }, 100);
      },
      onCancel: () => commonClose("menuDeleteAllAlert"),
      renderContent: () => <DeleteAlertContent deleteText={"모든 근을"} />,
    } as IModalProps["menuDeleteAllAlert"];
    return { menuDeleteAllAlert };
  }, [dTOData]);

  const {
    autoMenuOverPriceAlert,
    tutorialCompleteAlert,
    tutorialRestartAlert,
    myBonusGuideAlert,
    targetCalorieGuideAlert,
  } = useMemo(() => {
    // console.log("modalProps: autoMenuAlert memo");
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
          subText="구성한 근은 공식에서 삭제됩니다"
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
      numOfBtn: 1,
      contentDelay: 0,
      confirmLabel: "확인",
      showTopCancel: true,
      onConfirm: () => {
        commonClose("targetCalorieGuideAlert");
      },
      onCancel: () => commonClose("targetCalorieGuideAlert"),
      style: { width: SCREENWIDTH - 32 },
      renderContent: () => <CalGuideAlertContent />,
    } as IModalProps["targetCalorieGuideAlert"];

    return {
      autoMenuOverPriceAlert,
      tutorialCompleteAlert,
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
        if (!addressNoToDel) return;
        deleteAddressMutation.mutate(addressNoToDel as string);
        dispatch(setselectedAddrIdx(nextAddrIdx as number));
        router.push({ pathname: "/Order" });
        commonClose("addressDeleteAlert");
      },
      onCancel: () => commonClose("addressDeleteAlert"),
      renderContent: () => (
        <CommonAlertContent text={`해당 배송지를\n삭제합니다`} />
      ),
    } as IModalProps["addressDeleteAlert"];
    return { addressDeleteAlert };
  }, [modalState.values.addressDeleteAlert.addressNoToDel]);

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
          subText={"공식을 확인하고\n식품을 교체해주세요"}
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
          <DTooltip
            tooltipShow={true}
            boxTop={
              (modalState.values.tutorialTPSStart.tutorialStartCTABtnPy || 0) -
              insetTop -
              36
            }
            text="내 목표량에 완벽한 근의공식을 만들어봐요!"
            boxLeft={32}
          />
          <CtaButton
            onPress={() => {
              // dispatch(setTutorialProgress("AddMenu"));
              dispatch(closeModal({ name: "tutorialTPSStart" }));
              dispatch(setTutorialEnd());
              updateNotShowAgainList({ key: "tutorial", value: true });
              router.push("/(tabs)/Formula");
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
  }, [
    ctaBtnText,
    modalState.values.tutorialTPSStart.tutorialStartCTABtnPy,
    isTutorialMode,
  ]);

  // modal props obj
  const modalProps = {
    // alert
    // 끼니 추가삭제, 식품 삭제
    menuDeleteAllAlert,

    // 자동구성
    autoMenuOverPriceAlert,

    // 튜토리얼
    tutorialCompleteAlert,
    tutorialRestartAlert,

    // 정보
    myBonusGuideAlert,
    targetCalorieGuideAlert,

    // 결제
    payFailAlert,

    // 기타
    appUpdateAlert,
    requestErrorAlert,
    friendCdAlert,
    accountWithdrawalAlert,
    addressDeleteAlert,
    changeTargetAlert,
    noStockAlert,
    orderEmptyAlert,

    // transparentScreen (action 없음)
    tutorialTPSStart,
  };

  let numOfBtn = 0 as 0 | 1 | 2;
  let showTopCancel = false;
  let contentDelay = 0;
  let confirmLabel = "확인";
  let contentHeightBS = undefined;
  let onCancel = undefined;
  let onConfirm = undefined;
  let renderAlertContent = undefined;
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
      renderTPSContent,
    };
  } else if (currentModalNm.endsWith("Alert")) {
    numOfBtn = modalProps[currentModalNm]?.numOfBtn ?? 2;
    showTopCancel = modalProps[currentModalNm]?.showTopCancel ?? false;
    contentDelay = modalProps[currentModalNm]?.contentDelay ?? 0;
    confirmLabel = modalProps[currentModalNm]?.confirmLabel || "확인";
    onConfirm = modalProps[currentModalNm]?.onConfirm;
    onCancel = modalProps[currentModalNm]?.onCancel;
    renderAlertContent = modalProps[currentModalNm]?.renderContent;
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
    renderTPSContent,
  };
};
