// RN, expo
import { Animated, ImageSourcePropType } from "react-native";

// 3rd
import styled from "styled-components/native";
import Toast from "react-native-toast-message";

// doobi
import { IProductData } from "@/shared/api/types/product";
import {
  ENV,
  MAIN_FOODLIST_HEADER_HEIGHT,
  SCREENWIDTH,
  SERVICE_PRICE_PER_PRODUCT,
  SORT_FILTER_HEIGHT,
} from "@/shared/constants";
import { TextMain, TextSub } from "@/shared/ui/styledComps";
import { commaToNum } from "@/shared/utils/sumUp";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import colors from "@/shared/colors";

import { showProductSelectToast } from "@/shared/store/toastStore";
import { ViewStyle } from "react-native";
import { setAutoAddFood } from "@/features/reduxSlices/formulaSlice";
import ListHeaderComponent from "./ListHeaderComponent";
import ListFooterComponent from "./ListFooterComponent";
import { useRef } from "react";
import ListEmptyComponent from "./ListEmptyComponent";

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
interface IProductCardItem {
  item: IProductData;
  itemSize: number;
  badgeText?: string;
  showPlatformNm?: boolean;
  style?: ViewStyle;
}
const ProductCardItem = ({
  item,
  itemSize,
  showPlatformNm = true,
  style = {},
}: IProductCardItem) => {
  // redux
  const dispatch = useAppDispatch();
  const autoAddFoodForAdd = useAppSelector(
    (state) => state.formula.autoAddFoodForAdd
  );
  const autoAddFoodForChange = useAppSelector(
    (state) => state.formula.autoAddFoodForChange
  );

  // etc
  const isSelected = autoAddFoodForAdd?.productNo === item.productNo;

  const onPress = () => {
    if (isSelected) {
      Toast.hide();
      setTimeout(() => {
        dispatch(
          setAutoAddFood({
            foodForAdd: undefined,
            foodForChange: autoAddFoodForChange,
          })
        );
      }, 150);
      return;
    }
    dispatch(
      setAutoAddFood({
        foodForAdd: item,
        foodForChange: autoAddFoodForChange,
      })
    );
    showProductSelectToast();
  };

  return (
    <Box
      isSelected={isSelected}
      style={[
        {
          width: itemSize,
          boxShadow: isSelected ? "1px 2px 3px rgba(0, 0, 0, 0.12)" : "none",
        },
        { ...style },
      ]}
      onPress={onPress}
    >
      {showPlatformNm && <PlatformNm>{item.platformNm}</PlatformNm>}
      <Thumbnail
        source={{ uri: `${ENV.BASE_URL}${item.mainAttUrl}` }}
        style={{
          width: itemSize - 8,
          height: itemSize - 8,
        }}
      />
      <ProductNm
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ alignSelf: "flex-start" }}
      >
        {item.productNm}
      </ProductNm>
      <Price>
        {commaToNum(parseInt(item.price) + SERVICE_PRICE_PER_PRODUCT)}원
      </Price>
      {/* {badgeText && <ModernBadge>{badgeText}</ModernBadge>} */}
    </Box>
  );
};

const Foodlist = ({
  products = [],
  badgeText,
  horizontalScroll = false,
  itemSize = (SCREENWIDTH - 32 - 16) / 3,
  gap = 8,
  showPlatformNm = true,
  iconSource,
}: IProductCardSection) => {
  const numColumns = horizontalScroll
    ? 1
    : Math.floor(SCREENWIDTH / (itemSize + gap * 2));

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHideHeight = MAIN_FOODLIST_HEADER_HEIGHT - SORT_FILTER_HEIGHT;

  return (
    <>
      <Animated.FlatList
        // ListHeaderComponent={}
        data={products}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        progressViewOffset={MAIN_FOODLIST_HEADER_HEIGHT}
        refreshing={false}
        onRefresh={() => {
          console.log("Refreshing..."); // Implement your refresh logic here
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
            <ProductCardItem
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
        // To force FlatList to re-render when switching between grid/horizontal
        // key={horizontalScroll ? "h" : "v"}
        // ItemSeparatorComponent={() => <View style={{ width: gap }} />}
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

const Box = styled.TouchableOpacity<{ isSelected: boolean }>`
  border-radius: 5px;
  padding: 4px;
  border-width: ${({ isSelected }) => (isSelected ? 1 : 0)}px;
  border-color: ${({ isSelected }) =>
    isSelected ? colors.lineLight : colors.white};
  justify-content: center;
  align-items: center;
`;

const Thumbnail = styled.Image`
  width: ${(SCREENWIDTH - 32 - 16) / 3 - 8}px;
  height: ${(SCREENWIDTH - 32 - 16) / 3 - 8}px;
  border-radius: 4px;
`;

const PlatformNm = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  width: 100%;
  text-align: left;
  padding: 0 2px;
`;

const ProductNm = styled(TextMain)`
  width: 100%;
  font-size: 12px;
  line-height: 16px;
  text-align: right;
  padding: 0 2px;
  margin-top: 4px;
`;

const Price = styled(ProductNm)`
  color: ${colors.textSub};
  margin-top: 0;
`;
