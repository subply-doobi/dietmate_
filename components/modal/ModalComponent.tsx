import { useAppSelector } from "@/shared/hooks/reduxHooks";
import DAlert from "@/shared/ui/DAlert";
import DTPScreen from "@/shared/ui/DTPScreen";
import { useModalProps } from "@/shared/utils/modal/modalProps";
import React, { useMemo } from "react";
import DBottomSheet from "../common/bottomsheet/DBottomSheet";

const ModalComponent = () => {
  const modalSeq = useAppSelector((state) => state.modal.modalSeq);
  const { tutorialProgress, isTutorialMode } = useAppSelector(
    (state) => state.common
  );
  console.log("ModalComponent: isTutorialMode: ", isTutorialMode);
  console.log("ModalComponent: tutorialProgress: ", tutorialProgress);
  console.log("ModalComponent: modalSeq: ", modalSeq);

  const {
    currentModalNm,
    numOfBtn,
    showTopCancel,
    contentDelay,
    onConfirm,
    onCancel,
    confirmLabel,
    renderAlertContent,
    renderBSContent,
    contentHeightBS,
    renderTPSContent,
  } = useModalProps();

  return (
    <>
      {/* Alert */}
      <DAlert
        alertShow={currentModalNm.endsWith("Alert")}
        numOfBtn={numOfBtn}
        showTopCancel={showTopCancel}
        contentDelay={contentDelay}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmLabel={confirmLabel}
        renderContent={renderAlertContent || (() => <></>)}
      />

      {/* BottomSheet */}
      <DBottomSheet
        visible={currentModalNm.endsWith("BS")}
        renderContent={renderBSContent || (() => <></>)}
        onCancel={onCancel}
        contentHeight={contentHeightBS}
      />

      {/* TutorialTPS */}
      <DTPScreen
        visible={currentModalNm.includes("TPS")}
        contentDelay={0}
        renderContent={renderTPSContent || (() => <></>)}
      />
    </>
  );
};

export default ModalComponent;
