import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRef, useCallback, useEffect, useState, useMemo } from "react";
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
} from "@/features/reduxSlices/bottomSheetSlice";

import colors from "@/shared/colors";
import { StyleProp, ViewStyle } from "react-native";
import ProductToAddSelect from "./productSelectBSComps/ProductToAddSelect";
import ProductToDelSelect from "./productSelectBSComps/ProductToDelSelect";
import { usePathname } from "expo-router";

// configType
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
    snapPoints: [
      24 - 8 + 32 + 12 + 52 + 16,
      24 - 8 + 32 + 12 + 52 + 16 + 24 + 52 + 16,
    ],
  },
};

const GlobalBSM = () => {
  // navigation
  const pathName = usePathname();

  // redux
  const dispatch = useAppDispatch();
  const { bsNmArr, actionQueue, currentValue } = useAppSelector(
    (state) => state.bottomSheet
  );
  const action: IBSAction = actionQueue[0];
  const bsIdx = bsNmArr.length - 1;
  const currentBsNm = bsNmArr[bsIdx];

  // useState
  const [bsConfig, setBsConfig] = useState<IBSConfig>(bsBasicConfig);

  // useMemo
  const { tempConfig } = useMemo(() => {
    const temp = bsConfigByName[currentBsNm] || bsBasicConfig;
    const tempConfig: IBSConfig = {
      ...temp,
      bottomInset:
        pathName === "/Search" && currentBsNm === "productToAddSelect" ? 48 : 0,
    };
    return { tempConfig };
  }, [bsNmArr]);

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    // closed on mount
    bottomSheetModalRef.current?.close();
  }, []);

  // useEffect
  // bs action queue 처리
  // 1. action queue 첫 번째 부터 처리 후 해당 실행성공하면 onChange에서 action dequeue
  // 2. bs 상태 변하지 않았을 때 (==onChange 실행 안 될 경우) action dequeue
  // 3. 혹시 오류로 actionQueue 2개 초과해서 쌓이면 reset
  useEffect(() => {
    if (actionQueue.length > 2) {
      dispatch(resetBSActionQueue());
      return;
    }

    const isOpen = currentValue.index >= 0;

    if (!bottomSheetModalRef.current) {
      return;
    }

    if (actionQueue.length === 0 && !isOpen && bsNmArr.length !== 0) {
      setTimeout(() => {
        setBsConfig(tempConfig);
        bottomSheetModalRef.current?.present();
      }, 500);
      return;
    }

    if (actionQueue.length === 0) {
      return;
    }

    let shouldDequeue = false;
    switch (action.type) {
      case "open": {
        if (isOpen && bsNmArr.length === 1) {
          shouldDequeue = true;
          break;
        }

        if (isOpen && bsNmArr.length > 1) {
          bottomSheetModalRef.current.close();
          setTimeout(() => {
            bottomSheetModalRef.current?.present();
          }, 200);
        }

        if (!isOpen) {
          setBsConfig(tempConfig);
          setTimeout(() => {
            bottomSheetModalRef.current?.present();
          }, 200);
        }

        break;
      }
      case "close": {
        // close
        if (!isOpen) {
          // already closed
          shouldDequeue = true;
          break;
        }
        bottomSheetModalRef.current.close();
        break;
      }
      case "closeAll": {
        // close all
        if (!isOpen) {
          dispatch(removeAllBsNm());
          shouldDequeue = true;
          break;
        }
        bottomSheetModalRef.current.close();
        break;
      }
      case "snapToIndex": {
        // snap to index
        if (!isOpen || currentBsNm !== action.bsNm) {
          // not open or not the correct bottom sheet
          shouldDequeue = true;
          break;
        }
        if (isOpen && currentValue.index === action.index) {
          // Already at the target index, no need to snap.
          shouldDequeue = true;
          break;
        }

        bottomSheetModalRef.current.snapToIndex(action.index);
        break;
      }
      case "expand": {
        // expand
        if (!isOpen || currentBsNm !== action.bsNm) {
          // not open or not the correct bottom sheet
          shouldDequeue = true;
          break;
        }
        bottomSheetModalRef.current.expand();
        break;
      }
    }
    if (shouldDequeue) {
      dispatch(dequeueBSAction());
    }
  }, [
    bsNmArr,
    actionQueue,
    currentValue.index,
    currentValue.position,
    dispatch,
  ]);

  // fn
  // Modal state change handler
  const onChange = useCallback(
    (index: number, position: number) => {
      const changeType =
        currentValue.index < 0 && index >= 0
          ? "open"
          : currentValue.index >= 0 && index < 0
          ? "close"
          : currentValue.index >= 0 &&
            index >= 0 &&
            currentValue.position !== position
          ? "heightChange"
          : "none";
      // Always update currentValue in Redux
      dispatch(setCurrentValue({ index, position }));
      console.log("GlobalBSM onChange", changeType);
      // Determine if the action was successful based on previous and current state
      let shouldDequeue = false;

      switch (changeType) {
        case "open":
          if (actionQueue.length < 1) break;
          if (actionQueue[0]?.type === "open") {
            shouldDequeue = true;
          }
          break;
        case "close":
          setTimeout(() => {
            setBsConfig(bsBasicConfig);
          }, 300);
          if (actionQueue.length < 1) {
            dispatch(removeBSNm(currentBsNm));
          }
          if (actionQueue[0]?.type === "close") {
            shouldDequeue = true;
            dispatch(removeBSNm(currentBsNm));
          }
          if (actionQueue[0]?.type === "closeAll") {
            shouldDequeue = true;
            dispatch(removeAllBsNm());
          }
          if (actionQueue[0]?.type === "open") {
            shouldDequeue = true;
          }

          break;
        case "heightChange":
          if (
            actionQueue.length > 0 &&
            (actionQueue[0]?.type === "snapToIndex" ||
              actionQueue[0]?.type === "expand")
          ) {
            shouldDequeue = true;
          }
          break;
        default:
        // No action needed for "none" or other cases
      }

      if (shouldDequeue) {
        dispatch(dequeueBSAction());
      }
    },
    [actionQueue, currentValue, dispatch]
  );

  const onDismiss = () => {};

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
      onDismiss={onDismiss}
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
