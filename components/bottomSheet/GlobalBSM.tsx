import { useRef, useEffect, useState, JSX } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
  useBottomSheetTimingConfigs,
} from "@gorhom/bottom-sheet";
import {
  BS_ANIMATION_DURATION,
  DEFAULT_BOTTOM_TAB_HEIGHT,
  NUTRIENT_PROGRESS_HEIGHT,
  SCREENHEIGHT,
} from "@/shared/constants";
import CategoryFilterBSComp from "./sortFilterBSComps/CategoryFilterBSComp";
import BaseListTypeFilterBSComp from "./sortFilterBSComps/BaseListTypeFilterBSComp";
import PlatformFilterBSComp from "./sortFilterBSComps/PlatformFilterBSComp";
import SortBSComp from "./sortFilterBSComps/SortBSComp";

import {
  IBSNm,
  dequeueBSAction,
  setCurrentValue,
  IBSAction,
  closeBSWOAction,
  resetBSActionQueue,
  setLastSnapshot,
} from "@/features/reduxSlices/bottomSheetSlice";

import colors from "@/shared/colors";
import { StyleProp, ViewStyle } from "react-native";
import ProductToAddSelect from "./productSelectBSComps/ProductToAddSelect";
import ProductToDelSelect from "./productSelectBSComps/ProductToDelSelect";
import { usePathname } from "expo-router";
import SummaryInfoBSComp from "./summaryInfoBSComp/SummaryInfoBSComp";
import SummaryInfoHeaderBSComp from "./summaryInfoBSComp/SummaryInfoHeaderBSComp";
import SummaryInfoFooterBSComp from "./summaryInfoBSComp/SummaryInfoFooterBSComp";
import { ScrollView } from "react-native-gesture-handler";
import { Easing } from "react-native-reanimated";

interface IBSConfig {
  renderBackdrop?: (props: any) => JSX.Element;
  bsBackgroundColor: string;
  index?: number;
  snapPoints?: Array<string | number>;
  enableDynamicSizing?: boolean;
  maxDynamicContentSize?: number;
  handleIndicatorStyle: StyleProp<ViewStyle>;
  enablePanDownToClose?: boolean;
  bottomInset?: number;
}

const bsHeaderByName: Partial<Record<IBSNm, JSX.Element>> = {
  summaryInfo: <SummaryInfoHeaderBSComp />,
};

const bsFooterByName: Partial<Record<IBSNm, JSX.Element>> = {
  summaryInfo: <SummaryInfoFooterBSComp />,
};

const bsCompByName: Record<IBSNm, JSX.Element> = {
  // sort and filter
  baseListTypeFilter: <BaseListTypeFilterBSComp />,
  categoryFilter: <CategoryFilterBSComp />,
  platformFilter: <PlatformFilterBSComp />,
  sort: <SortBSComp />,

  // product select
  productToAddSelect: <ProductToAddSelect />,
  productToDelSelect: <ProductToDelSelect />,

  // formula summary
  summaryInfo: <SummaryInfoBSComp />,
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
  enableDynamicSizing: true,
  maxDynamicContentSize: SCREENHEIGHT * 0.6,
  enablePanDownToClose: true,
};

const bsOpacityConfig: IBSConfig = {
  renderBackdrop: undefined,
  bsBackgroundColor: colors.blackOpacity80,
  handleIndicatorStyle: { backgroundColor: colors.white },
  index: undefined,
  snapPoints: undefined,
  enableDynamicSizing: true,
  maxDynamicContentSize: SCREENHEIGHT * 0.6,
  enablePanDownToClose: true,
};

export const bsConfigByName: Partial<Record<IBSNm, IBSConfig>> = {
  productToDelSelect: { ...bsOpacityConfig },
  productToAddSelect: {
    ...bsOpacityConfig,
    maxDynamicContentSize: SCREENHEIGHT * 0.8,
    enablePanDownToClose: false,
    snapPoints: [
      24 - 8 + 32 + 12 + 52 + 16 + NUTRIENT_PROGRESS_HEIGHT,
      24 - 8 + 32 + 12 + 52 + 16 + 24 + 52 + 16 + NUTRIENT_PROGRESS_HEIGHT,
    ],
  },
  summaryInfo: {
    ...bsOpacityConfig,
    enableDynamicSizing: false,
    maxDynamicContentSize: undefined,
    bottomInset: 48,
    enablePanDownToClose: false,
    snapPoints: [72, SCREENHEIGHT - 136],
  },
};

const GlobalBSM = () => {
  // state
  const dispatch = useAppDispatch();
  const { bsNmArr, actionQueue, currentValue, lastSnapshot } = useAppSelector(
    (state) => state.bottomSheet
  );
  const currentBsNm = bsNmArr[bsNmArr.length - 1];
  const [configNm, setConfigNm] = useState<IBSNm | undefined>(undefined);
  const action: IBSAction = actionQueue[0] || undefined;
  const bsConfig = bsConfigByName[configNm!] || bsBasicConfig;

  // bs
  const bsTimingConfig = useBottomSheetTimingConfigs({
    duration: BS_ANIMATION_DURATION,
    easing: Easing.circle,
  });

  // --- refs ---
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetScrollViewRef = useRef<ScrollView>(null);
  const currentScrollOffsetRef = useRef(0);
  const pathname = usePathname();
  const actionQueueRef = useRef(actionQueue);
  const currentValueRef = useRef(currentValue);
  const lastSnapshotRef = useRef(lastSnapshot);

  // --- Effects ---
  useEffect(() => {
    // Close on mount
    bottomSheetModalRef.current?.close();
  }, []);

  useEffect(() => {
    actionQueueRef.current = actionQueue;
  }, [actionQueue]);

  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    lastSnapshotRef.current = lastSnapshot;
  }, [lastSnapshot]);

  useEffect(() => {
    // console.log("----- GlobalBSM useEffect action ------");
    // console.log("bsNmArr:", bsNmArr);
    // console.log("action:", action);
    // console.log("actionQueue:", JSON.stringify(actionQueue, null, 2));
    // console.log("currentValue:", currentValue);
    // console.log("---------------------------------------");

    if (!bottomSheetModalRef.current) return;
    if (!action) return;

    if (actionQueue.length > 4) {
      dispatch(resetBSActionQueue());
      return;
    }
    let isForceDequeue = false;
    switch (action.type) {
      case "open": {
        setTimeout(() => {
          setConfigNm(action.bsNm);
        }, 0);
        setTimeout(() => {
          bottomSheetModalRef.current?.present();
        }, 50);
        // If already open, manually dequeue
        if (currentBsNm === action.bsNm && currentValue.index >= 0) {
          isForceDequeue = true;
        }
        break;
      }
      case "close": {
        bottomSheetModalRef.current?.close();
        // If already closed, manually dequeue
        if (currentValue.index < 0) {
          isForceDequeue = true;
        }
        break;
      }
      case "closeAll": {
        bottomSheetModalRef.current?.close();
        // If already closed, manually dequeue
        if (currentValue.index < 0) {
          isForceDequeue = true;
        }
        break;
      }
      case "snapToIndex": {
        if (currentBsNm !== action.bsNm) {
          isForceDequeue = true;
          break;
        }
        // If already at the target index, manually dequeue
        if (currentValue.index === action.index) {
          isForceDequeue = true;
        } else {
          bottomSheetModalRef.current?.snapToIndex(action.index);
        }
        break;
      }
      case "expand": {
        if (currentBsNm !== action.bsNm) {
          isForceDequeue = true;
          break;
        }
        bottomSheetModalRef.current?.expand();
        break;
      }
      case "scrollTo": {
        if (currentBsNm !== action.bsNm) {
          isForceDequeue = true;
          break;
        }
        bottomSheetScrollViewRef.current?.scrollTo({
          x: action.x || 0,
          y: action.y || 0,
          animated: action.animated !== false,
        });
        // Immediately dequeue scroll actions since they don't have a completion callback
        isForceDequeue = true;
        break;
      }
    }
    if (isForceDequeue) dispatch(dequeueBSAction());
  }, [dispatch, actionQueue, bsNmArr, currentValue]);

  // --- Handlers ---
  const onChange = (index: number, position: number) => {
    const prevValue = currentValueRef.current;
    const lastSnapshot = lastSnapshotRef.current;
    const changeType =
      prevValue.index < 0 && index >= 0
        ? "open"
        : prevValue.index >= 0 && index < 0
        ? "close"
        : prevValue.index >= 0 && index >= 0 && prevValue.position !== position
        ? "heightChange"
        : "none";
    dispatch(setCurrentValue({ index, position }));

    const actionLength = actionQueueRef.current.length;
    const action = actionQueueRef.current[0] || undefined;
    let shouldDequeue = false;
    switch (changeType) {
      case "open":
        if (action?.type !== "open") {
          break;
        }
        shouldDequeue = true;

        // set lastSnapshot if exist
        if (
          !lastSnapshot ||
          lastSnapshot.bsNm !== action.bsNm ||
          actionLength !== 1
        ) {
          currentScrollOffsetRef.current = 0;
          break;
        }

        console.log("[GlobalBSM] Restoring last snapshot:", lastSnapshot);
        setTimeout(() => {
          bottomSheetModalRef.current?.snapToIndex(lastSnapshot.index);
          // Restore scroll position after layout settles
        }, 0);
        setTimeout(() => {
          bottomSheetScrollViewRef.current?.scrollTo({
            y: lastSnapshot.scrollOffset,
            animated: true,
          });
          currentScrollOffsetRef.current = lastSnapshot.scrollOffset;
        }, BS_ANIMATION_DURATION);
        dispatch(setLastSnapshot(null));

        break;
      case "close":
        if (action?.type === "close" || action?.type === "closeAll") {
          shouldDequeue = true;
          const lastSnapShot = {
            bsNm: currentBsNm,
            index: prevValue.index,
            position: prevValue.position,
            scrollOffset: currentScrollOffsetRef.current,
          };
          dispatch(setLastSnapshot(lastSnapShot));
          break;
        }
        dispatch(closeBSWOAction({ from: "GlobalBSM.tsx" }));
        break;
      case "heightChange":
        if (action?.type === "snapToIndex" || action?.type === "expand")
          shouldDequeue = true;
        break;
      default:
        // No action needed
        break;
    }
    // dequeue
    if (shouldDequeue) {
      // console.log("onChange Dequeue", bsNmArr, action);
      dispatch(dequeueBSAction());
    }
  };

  // --- Render ---
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      bottomInset={bsConfig.bottomInset}
      index={0}
      snapPoints={bsConfig.snapPoints}
      enableDynamicSizing={bsConfig.enableDynamicSizing}
      handleIndicatorStyle={bsConfig.handleIndicatorStyle}
      maxDynamicContentSize={bsConfig.maxDynamicContentSize}
      backdropComponent={bsConfig.renderBackdrop}
      enablePanDownToClose={bsConfig.enablePanDownToClose}
      onDismiss={() => {}}
      backgroundStyle={{
        backgroundColor: bsConfig.bsBackgroundColor,
      }}
      animationConfigs={bsTimingConfig}
      onChange={onChange}
    >
      {bsHeaderByName[configNm!] || <></>}
      <BottomSheetScrollView
        ref={bottomSheetScrollViewRef}
        onScroll={(e) => {
          currentScrollOffsetRef.current = e.nativeEvent.contentOffset.y;
        }}
      >
        {bsCompByName[configNm!] || <></>}
      </BottomSheetScrollView>
      {bsFooterByName[configNm!] || <></>}
    </BottomSheetModal>
  );
};

export default GlobalBSM;
