import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRef, useCallback, useEffect } from "react";
import { closeBottomSheet } from "@/features/reduxSlices/commonSlice";
import { SCREENHEIGHT } from "@/shared/constants";
import CategoryFilterBSComp from "./sortFilterBSComps/CategoryFilterBSComp";
import BaseListTypeFilterBSComp from "./sortFilterBSComps/BaseListTypeFilterBSComp";
import PlatformFilterBSComp from "./sortFilterBSComps/PlatformFilterBSComp";
import SortBSComp from "./sortFilterBSComps/SortBSComp";

export type IBSCompNm =
  | ""
  | "baseListTypeFilter"
  | "categoryFilter"
  | "platformFilter"
  | "sort";
const bsComp: Record<IBSCompNm, JSX.Element> = {
  baseListTypeFilter: <BaseListTypeFilterBSComp />,
  categoryFilter: <CategoryFilterBSComp />,
  platformFilter: <PlatformFilterBSComp />,
  sort: <SortBSComp />,
  "": <></>,
};

const GlobalBSM = () => {
  // redux
  const dispatch = useAppDispatch();
  const bsName = useAppSelector((state) => state.common.bottomSheetName);

  // bottomSheet
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callback
  // const handleSheetChanges = useCallback(
  //   (index: number) => {
  //     console.log("handleSheetChanges", index);
  //   },
  //   []
  // );

  // useEffect
  useEffect(() => {
    if (bsName) {
      console.log("GlobalBSM useEffect", bsName);
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [bsName]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.8}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      // onChange={handleSheetChanges}
      // index={0}
      // snapPoints={["30%"]}
      enableDynamicSizing={true}
      maxDynamicContentSize={SCREENHEIGHT * 0.6}
      backdropComponent={renderBackdrop}
      onDismiss={() => dispatch(closeBottomSheet())}
    >
      <BottomSheetScrollView>{bsComp[bsName]}</BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default GlobalBSM;
