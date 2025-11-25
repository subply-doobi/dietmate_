import { JSX } from "react";
import colors from "@/shared/colors";
import {
  SCREENHEIGHT,
  NUTRIENT_PROGRESS_HEIGHT,
  DEFAULT_BOTTOM_TAB_HEIGHT,
} from "@/shared/constants";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { StyleProp, ViewStyle } from "react-native";
import ProductToAddSelect from "./productSelectBSComps/ProductToAddSelect";
import ProductToDelSelect from "./productSelectBSComps/ProductToDelSelect";
import BaseListTypeFilterBSComp from "./sortFilterBSComps/BaseListTypeFilterBSComp";
import CategoryFilterBSComp from "./sortFilterBSComps/CategoryFilterBSComp";
import PlatformFilterBSComp from "./sortFilterBSComps/PlatformFilterBSComp";
import SortBSComp from "./sortFilterBSComps/SortBSComp";
import SummaryInfoBSComp from "./summaryInfoBSComp/SummaryInfoBSComp";
import SummaryInfoFooterBSComp from "./summaryInfoBSComp/SummaryInfoFooterBSComp";
import SummaryInfoHeaderBSComp from "./summaryInfoBSComp/SummaryInfoHeaderBSComp";

export type IBSNm =
  // sort and filter
  | "baseListTypeFilter"
  | "categoryFilter"
  | "platformFilter"
  | "sort"
  // product select
  | "productToAddSelect"
  | "productToDelSelect"
  // formula summary
  | "summaryInfo";

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

export const bsHeaderByName: Partial<Record<IBSNm, JSX.Element>> = {
  summaryInfo: <SummaryInfoHeaderBSComp />,
};

export const bsFooterByName: Partial<Record<IBSNm, JSX.Element>> = {
  summaryInfo: <SummaryInfoFooterBSComp />,
};

export const bsCompByName: Record<IBSNm, JSX.Element> = {
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

export const bsBasicConfig: IBSConfig = {
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
    bottomInset: DEFAULT_BOTTOM_TAB_HEIGHT,
    enablePanDownToClose: false,
    snapPoints: [
      24 + 20 + 8 + 48 + 8,
      SCREENHEIGHT - DEFAULT_BOTTOM_TAB_HEIGHT - 48,
    ],
  },
};
