import { useRef, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetTimingConfigs,
} from "@gorhom/bottom-sheet";
import { BS_ANIMATION_DURATION } from "@/shared/constants";

import {
  dequeueBSAction,
  setCurrentValue,
  IBSAction,
  closeBSWOAction,
  resetBSActionQueue,
  setLastSnapshot,
} from "@/features/reduxSlices/bottomSheetSlice";

import { usePathname } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  bsBasicConfig,
  bsCompByName,
  bsConfigByName,
  bsFooterByName,
  bsHeaderByName,
  IBSNm,
} from "./bsConfig";

const GlobalBSM = () => {
  // insets
  const insets = useSafeAreaInsets();

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
      bottomInset={insets.bottom + (bsConfig.bottomInset ?? 0)}
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
        onScroll={(e: any) => {
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
