import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { NUTRIENT_PROGRESS_HEIGHT, SCREENHEIGHT } from "@/shared/constants";
import CategoryFilterBSComp from "./sortFilterBSComps/CategoryFilterBSComp";
import BaseListTypeFilterBSComp from "./sortFilterBSComps/BaseListTypeFilterBSComp";
import PlatformFilterBSComp from "./sortFilterBSComps/PlatformFilterBSComp";
import SortBSComp from "./sortFilterBSComps/SortBSComp";

import {
  clearBSAction,
  closeBottomSheet,
  IBSNm,
  setCurrentValue,
} from "@/features/reduxSlices/bottomSheetSlice";

import colors from "@/shared/colors";
import { StyleProp, ViewStyle } from "react-native";
import ProductToAddSelect from "./sortFilterBSComps/ProductToAddSelect";
import ProductToDelSelect from "./sortFilterBSComps/ProductToDelSelect";

// configType
interface IBSConfig {
  renderBackdrop?: (props: any) => JSX.Element;
  bsBackgroundColor: string;
  index?: number;
  snapPoints?: Array<string | number>;
  maxDynamicContentSize?: number;
  handleIndicatorStyle: StyleProp<ViewStyle>;
  enablePanDownToClose?: boolean;
}

const bsCompByName: Record<IBSNm, JSX.Element> = {
  none: <></>,
  // sort and filter
  baseListTypeFilter: <BaseListTypeFilterBSComp />,
  categoryFilter: <CategoryFilterBSComp />,
  platformFilter: <PlatformFilterBSComp />,
  sort: <SortBSComp />,

  // product select
  productToAddSelect: <ProductToAddSelect />,
  productToDelSelect: <ProductToDelSelect />,
};

const bsBasicConfig: IBSConfig = {
  renderBackdrop: (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.8}
    />
  ),
  bsBackgroundColor: colors.white,
  index: undefined,
  handleIndicatorStyle: {},
  snapPoints: undefined,
  maxDynamicContentSize: SCREENHEIGHT * 0.6,
  enablePanDownToClose: true,
};

const bsOpacityConfig: IBSConfig = {
  renderBackdrop: undefined,
  bsBackgroundColor: colors.blackOpacity80,
  handleIndicatorStyle: { backgroundColor: colors.white },
  index: undefined,
  snapPoints: undefined,
  maxDynamicContentSize: SCREENHEIGHT * 0.6,
  enablePanDownToClose: true,
};

const bsConfigByName: Partial<Record<IBSNm, IBSConfig>> = {
  productToDelSelect: { ...bsOpacityConfig },
  productToAddSelect: {
    ...bsOpacityConfig,
    maxDynamicContentSize: SCREENHEIGHT * 0.8,
    snapPoints: [
      24 + 32 + NUTRIENT_PROGRESS_HEIGHT + 12 + 52 + 16,
      24 + 32 + NUTRIENT_PROGRESS_HEIGHT + 12 + 52 + 16 + 72 + 24,
    ],
  },
};
// 32 + 70 + 40 + 72 + 24 + 24 + 40
const GlobalBSM = () => {
  // redux
  const dispatch = useAppDispatch();
  const {
    bsNm,
    bsAction,
    product: { add, del },
  } = useAppSelector((state) => state.bottomSheet);

  // useState
  const [visibleBsNm, setVisibleBsNm] = useState<IBSNm>("none");

  // useMemo
  const bsConfig = useMemo(
    () => bsConfigByName[visibleBsNm] || bsBasicConfig,
    [visibleBsNm]
  );

  // bottomSheet
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // useEffect
  useEffect(() => {
    if (bsNm === "none") {
      bottomSheetModalRef.current?.dismiss();
    } else {
      setVisibleBsNm(bsNm);
      bottomSheetModalRef.current?.present();
    }
  }, [bsNm]);

  useEffect(() => {
    if (!bsAction || !bottomSheetModalRef.current) return;

    switch (bsAction.type) {
      case "close":
        bottomSheetModalRef.current.close();
        break;
      case "forceClose":
        bottomSheetModalRef.current.forceClose();
        break;
      case "dismiss":
        bottomSheetModalRef.current.dismiss();
        break;
      case "collapse":
        bottomSheetModalRef.current.collapse();
        break;
      case "expand":
        bottomSheetModalRef.current.expand();
        break;
      case "present":
        bottomSheetModalRef.current.present();
        break;
      case "snapToIndex":
        bottomSheetModalRef.current.snapToIndex(bsAction.index);
        break;
      case "snapToPosition":
        bottomSheetModalRef.current.snapToPosition?.(bsAction.position);
        break;
      default:
        break;
    }
    dispatch(clearBSAction());
  }, [bsAction, dispatch]);

  // fn
  const onChange = useCallback((index: number, position: number) => {
    dispatch(setCurrentValue({ index, position }));
  }, []);

  return (
    <BottomSheetModal
      key={bsNm}
      ref={bottomSheetModalRef}
      // index={-1}
      snapPoints={bsConfig.snapPoints}
      enableDynamicSizing={true}
      handleIndicatorStyle={bsConfig.handleIndicatorStyle}
      maxDynamicContentSize={bsConfig.maxDynamicContentSize}
      backdropComponent={bsConfig.renderBackdrop}
      enablePanDownToClose={bsConfig.enablePanDownToClose}
      onDismiss={() => {
        setVisibleBsNm("none");
        dispatch(closeBottomSheet());
      }}
      backgroundStyle={{
        backgroundColor: bsConfig.bsBackgroundColor,
      }}
      onChange={onChange}
    >
      <BottomSheetScrollView>{bsCompByName[bsNm]}</BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default GlobalBSM;
