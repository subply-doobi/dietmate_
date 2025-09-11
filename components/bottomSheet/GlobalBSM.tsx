import { useRef, useCallback, useEffect, useState, useMemo, JSX } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { SCREENHEIGHT } from "@/shared/constants";
import CategoryFilterBSComp from "./sortFilterBSComps/CategoryFilterBSComp";
import BaseListTypeFilterBSComp from "./sortFilterBSComps/BaseListTypeFilterBSComp";
import PlatformFilterBSComp from "./sortFilterBSComps/PlatformFilterBSComp";
import SortBSComp from "./sortFilterBSComps/SortBSComp";

import {
  IBSNm,
  dequeueBSAction,
  setCurrentValue,
  IBSAction,
  removeBSNm,
  removeAllBsNm,
  resetBSActionQueue,
  addBSNm,
} from "@/features/reduxSlices/bottomSheetSlice";

import colors from "@/shared/colors";
import { StyleProp, ViewStyle } from "react-native";
import ProductToAddSelect from "./productSelectBSComps/ProductToAddSelect";
import ProductToDelSelect from "./productSelectBSComps/ProductToDelSelect";
import { usePathname } from "expo-router";

// --- Custom Hook for latest ref ---
function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

interface IBSConfig {
  renderBackdrop?: (props: any) => JSX.Element;
  bsBackgroundColor: string;
  index?: number;
  snapPoints?: Array<string | number>;
  maxDynamicContentSize?: number;
  handleIndicatorStyle: StyleProp<ViewStyle>;
  enablePanDownToClose?: boolean;
  bottomInset?: number;
}

const bsCompByName: Record<IBSNm, JSX.Element> = {
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
    enablePanDownToClose: false,
    snapPoints: [
      24 - 8 + 32 + 12 + 52 + 16,
      24 - 8 + 32 + 12 + 52 + 16 + 24 + 52 + 16,
    ],
  },
};

const GlobalBSM = () => {
  const pathName = usePathname();
  const dispatch = useAppDispatch();
  const { bsNmArr, actionQueue, currentValue } = useAppSelector(
    (state) => state.bottomSheet
  );

  // --- Latest value refs ---
  const actionQueueRef = useLatestRef(actionQueue);
  const currentValueRef = useLatestRef(currentValue);
  const currentBsNm = bsNmArr[bsNmArr.length - 1];
  const currentBsNmRef = useLatestRef(currentBsNm);

  // --- State and refs ---
  const [bsConfig, setBsConfig] = useState(bsBasicConfig);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // --- Memoized config for current bottom sheet ---
  const tempConfig = useMemo(() => {
    const temp = bsConfigByName[currentBsNm] || bsBasicConfig;
    return {
      ...temp,
      bottomInset:
        pathName === "/Search" && currentBsNm === "productToAddSelect" ? 48 : 0,
    };
  }, [bsNmArr, pathName, currentBsNm]);

  // --- Effects ---
  useEffect(() => {
    // Close on mount
    bottomSheetModalRef.current?.close();
  }, []);

  useEffect(() => {
    // Present if needed when bsNmArr changes
    const isOpen = currentValue.index >= 0;
    if (actionQueue.length === 0 && !isOpen && bsNmArr.length !== 0) {
      setTimeout(() => {
        setBsConfig(tempConfig);
        bottomSheetModalRef.current?.present();
      }, 500);
      return;
    }
  }, [bsNmArr]);

  useEffect(() => {
    if (actionQueue.length > 2) {
      dispatch(resetBSActionQueue());
      return;
    }
    const isOpen = currentValue.index >= 0;
    if (!bottomSheetModalRef.current) return;
    if (actionQueue.length === 0) return;

    const action: IBSAction = actionQueue[0];
    let shouldDequeue = false;
    switch (action.type) {
      case "open":
        if (isOpen && bsNmArr.length > 0 && currentBsNm === action.bsNm) {
          shouldDequeue = true;
          break;
        }
        if (isOpen && bsNmArr.length > 0 && currentBsNm !== action.bsNm) {
          dispatch(addBSNm(action.bsNm));
          bottomSheetModalRef.current.close();
          setTimeout(
            () => setBsConfig(bsConfigByName[action.bsNm] || bsBasicConfig),
            300
          );
          setTimeout(() => bottomSheetModalRef.current?.present(), 500);
        }
        if (!isOpen) {
          dispatch(addBSNm(action.bsNm));
          setBsConfig(bsConfigByName[action.bsNm] || bsBasicConfig);
          setTimeout(() => bottomSheetModalRef.current?.present(), 200);
        }
        break;
      case "close":
        if (!isOpen) {
          dispatch(removeBSNm(currentBsNm));
          shouldDequeue = true;
          break;
        }
        bottomSheetModalRef.current.close();
        break;
      case "closeAll":
        if (!isOpen) {
          dispatch(removeAllBsNm());
          shouldDequeue = true;
          break;
        }
        bottomSheetModalRef.current.close();
        break;
      case "snapToIndex":
        if (!isOpen || currentBsNm !== action.bsNm) {
          shouldDequeue = true;
          break;
        }
        if (isOpen && currentValue.index === action.index) {
          shouldDequeue = true;
          break;
        }
        bottomSheetModalRef.current.snapToIndex(action.index);
        break;
      case "expand":
        if (!isOpen || currentBsNm !== action.bsNm) {
          shouldDequeue = true;
          break;
        }
        bottomSheetModalRef.current.expand();
        break;
    }
    if (shouldDequeue) dispatch(dequeueBSAction());
  }, [actionQueue, dispatch, currentValue.index]);

  // --- Handlers ---
  const onChange = useCallback(
    (index: number, position: number) => {
      const latestActionQueue = actionQueueRef.current;
      const latestCurrentValue = currentValueRef.current;
      const latestCurrentBsNm = currentBsNmRef.current;
      const changeType =
        latestCurrentValue.index < 0 && index >= 0
          ? "open"
          : latestCurrentValue.index >= 0 && index < 0
          ? "close"
          : latestCurrentValue.index >= 0 &&
            index >= 0 &&
            latestCurrentValue.position !== position
          ? "heightChange"
          : "none";
      dispatch(setCurrentValue({ index, position }));
      let shouldDequeue = false;
      switch (changeType) {
        case "open":
          if (latestActionQueue[0]?.type === "open") shouldDequeue = true;
          break;
        case "close":
          if (latestActionQueue.length === 0)
            dispatch(removeBSNm(latestCurrentBsNm));
          if (latestActionQueue[0]?.type === "open") break;
          if (latestActionQueue[0]?.type === "close") {
            shouldDequeue = true;
            dispatch(removeBSNm(latestCurrentBsNm));
          }
          if (latestActionQueue[0]?.type === "closeAll") {
            shouldDequeue = true;
            dispatch(removeAllBsNm());
          }
          break;
        case "heightChange":
          if (
            latestActionQueue.length > 0 &&
            (latestActionQueue[0]?.type === "snapToIndex" ||
              latestActionQueue[0]?.type === "expand")
          ) {
            shouldDequeue = true;
          }
          break;
        default:
        // No action needed
      }
      if (shouldDequeue) dispatch(dequeueBSAction());
    },
    [dispatch]
  );

  // --- Render ---
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      bottomInset={bsConfig.bottomInset}
      index={0}
      snapPoints={bsConfig.snapPoints}
      enableDynamicSizing={true}
      handleIndicatorStyle={bsConfig.handleIndicatorStyle}
      maxDynamicContentSize={bsConfig.maxDynamicContentSize}
      backdropComponent={bsConfig.renderBackdrop}
      enablePanDownToClose={bsConfig.enablePanDownToClose}
      onDismiss={() => {}}
      backgroundStyle={{
        backgroundColor: bsConfig.bsBackgroundColor,
      }}
      onChange={onChange}
    >
      <BottomSheetScrollView>
        {bsCompByName[currentBsNm] || <></>}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default GlobalBSM;
