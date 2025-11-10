import { useAppSelector } from "@/shared/hooks/reduxHooks";
import DAlert from "@/shared/ui/DAlert";
import DTPScreen from "@/shared/ui/DTPScreen";
import { useModalProps } from "@/shared/utils/modal/modalProps";

const ModalComponent = () => {
  // redux
  const { isTutorialMode } = useAppSelector((state) => state.common);
  const {
    currentModalNm,
    numOfBtn,
    showTopCancel,
    contentDelay,
    style,
    onConfirm,
    onCancel,
    confirmLabel,
    renderAlertContent,
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

      {/* TutorialTPS */}
      <DTPScreen
        visible={isTutorialMode && currentModalNm.includes("TPS")}
        style={style}
        contentDelay={0}
        renderContent={renderTPSContent || (() => <></>)}
      />
    </>
  );
};

export default ModalComponent;
