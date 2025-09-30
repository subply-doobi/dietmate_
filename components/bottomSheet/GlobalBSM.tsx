import { useRef, useEffect, useState, JSX } from "react";
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
  closeBSWOAction,
  resetBSActionQueue,
} from "@/features/reduxSlices/bottomSheetSlice";
import QtyChangeBSComp from "./QtyChangeBSComp";

import colors from "@/shared/colors";
import { StyleProp, ViewStyle } from "react-native";
import ProductToAddSelect from "./productSelectBSComps/ProductToAddSelect";
import ProductToDelSelect from "./productSelectBSComps/ProductToDelSelect";
import { usePathname } from "expo-router";
import SummaryInfoBSComp from "./summaryInfoBSComp/SummaryInfoBSComp";
import SummaryInfoHeaderBSComp from "./summaryInfoBSComp/SummaryInfoHeaderBSComp";

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

const bsHeaderByName: Partial<Record<IBSNm, JSX.Element>> = {
  summaryInfo: <SummaryInfoHeaderBSComp />,
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

  // menu qty change
  qtyChange: <QtyChangeBSComp />,

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

export const bsConfigByName: Partial<Record<IBSNm, IBSConfig>> = {
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
  qtyChange: { ...bsOpacityConfig, maxDynamicContentSize: SCREENHEIGHT * 0.9 },
  summaryInfo: {
    ...bsOpacityConfig,
    maxDynamicContentSize: SCREENHEIGHT * 0.82,
    bottomInset: 48,
    enablePanDownToClose: false,
    snapPoints: [72],
  },
};

const GlobalBSM = () => {
  // state
  const dispatch = useAppDispatch();

  const { bsNmArr, actionQueue, currentValue } = useAppSelector(
    (state) => state.bottomSheet
  );
  const currentBsNm = bsNmArr[bsNmArr.length - 1];
  const [configNm, setConfigNm] = useState<IBSNm | undefined>(undefined);
  const action: IBSAction = actionQueue[0] || undefined;
  const bsConfig = bsConfigByName[configNm!] || bsBasicConfig;

  // --- refs ---
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const actionQueueRef = useRef(actionQueue);
  const currentValueRef = useRef(currentValue);

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
    }
    if (isForceDequeue) dispatch(dequeueBSAction());
  }, [dispatch, actionQueue, bsNmArr, currentValue]);

  // --- Handlers ---
  const onChange = (index: number, position: number) => {
    const prevValue = currentValueRef.current;
    const changeType =
      prevValue.index < 0 && index >= 0
        ? "open"
        : prevValue.index >= 0 && index < 0
        ? "close"
        : prevValue.index >= 0 && index >= 0 && prevValue.position !== position
        ? "heightChange"
        : "none";
    dispatch(setCurrentValue({ index, position }));

    const action = actionQueueRef.current[0] || undefined;
    let shouldDequeue = false;
    switch (changeType) {
      case "open":
        if (action?.type === "open") shouldDequeue = true;
        break;
      case "close":
        if (action?.type === "close" || action?.type === "closeAll") {
          shouldDequeue = true;
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
      {bsHeaderByName[configNm!] || <></>}
      <BottomSheetScrollView>
        {bsCompByName[configNm!] || <></>}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default GlobalBSM;
