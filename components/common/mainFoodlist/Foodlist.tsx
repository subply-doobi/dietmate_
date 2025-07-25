// RN, expo
import { Animated, ImageSourcePropType } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { IProductData } from "@/shared/api/types/product";
import {
  ENV,
  MAIN_FOODLIST_HEADER_HEIGHT,
  SCREENWIDTH,
  SORT_FILTER_HEIGHT,
} from "@/shared/constants";
import { TextMain, TextSub } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import ListHeaderComponent from "./ListHeaderComponent";
import ListFooterComponent from "./ListFooterComponent";
import { useEffect, useRef } from "react";
import ListEmptyComponent from "./ListEmptyComponent";
import ProductItem from "./ProductItem";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useIsFocused } from "@react-navigation/native";
import {
  closeBS,
  closeBSAll,
  openBS,
  snapBS,
} from "@/features/reduxSlices/bottomSheetSlice";

interface IProductCardSection {
  title?: string;
  products: IProductData[];
  subTitle?: string;
  badgeText?: string;
  horizontalScroll?: boolean;
  itemSize?: number;
  gap?: number;
  showPlatformNm?: boolean;
  iconSource?: ImageSourcePropType;
}

const Foodlist = ({
  products = [],
  badgeText,
  horizontalScroll = false,
  itemSize = (SCREENWIDTH - 32 - 16) / 3,
  gap = 8,
  showPlatformNm = true,
  iconSource,
}: IProductCardSection) => {
  // navigation
  const isFocused = useIsFocused();

  // redux
  const currentValue = useAppSelector(
    (state) => state.bottomSheet.currentValue
  );
  const pToAdd = useAppSelector((state) => state.bottomSheet.product.add);
  const dispatch = useAppDispatch();

  const numColumns = horizontalScroll
    ? 1
    : Math.floor(SCREENWIDTH / (itemSize + gap * 2));

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<IProductData>>(null);
  const headerHideHeight = MAIN_FOODLIST_HEADER_HEIGHT - SORT_FILTER_HEIGHT;

  useEffect(() => {
    if (!isFocused) {
      dispatch(closeBSAll());
      return;
    }

    if (currentValue.index < 0 && pToAdd.length > 0) {
      dispatch(openBS("productToAddSelect"));
      dispatch(snapBS({ index: 1, bsNm: "productToAddSelect" }));
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 1, animated: false });
      }, 100);
    }
  }, [isFocused]);

  return (
    <>
      <Animated.FlatList
        ref={flatListRef}
        data={products}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        progressViewOffset={MAIN_FOODLIST_HEADER_HEIGHT}
        refreshing={false}
        onRefresh={() => {
          console.log("Refreshing...");
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        keyExtractor={(item) => item.productNo}
        horizontal={horizontalScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          width: "100%",
          paddingTop: MAIN_FOODLIST_HEADER_HEIGHT + 4,
          paddingBottom: 64,
          paddingHorizontal: 16,
          zIndex: 1,
          gap,
        }}
        numColumns={numColumns}
        renderItem={({ item, index }) => {
          const isLastColumn = (index + 1) % numColumns === 0;
          const isLastRow = index >= products.length - numColumns;
          return (
            <ProductItem
              flatListRef={flatListRef}
              item={item}
              itemSize={itemSize}
              badgeText={badgeText}
              showPlatformNm={showPlatformNm}
              style={{
                marginRight: isLastColumn ? 0 : gap,
                marginBottom: isLastRow ? 0 : gap,
              }}
            />
          );
        }}
      />

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.white,
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, headerHideHeight],
                outputRange: [0, -headerHideHeight],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        <ListHeaderComponent />
      </Animated.View>
    </>
  );
};
export default Foodlist;
