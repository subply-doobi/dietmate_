import { View, Text, ViewStyle, FlatList, Animated } from "react-native";
import React, { RefObject } from "react";
import { IProductData } from "@/shared/api/types/product";
import styled from "styled-components/native";
import {
  ENV,
  SCREENWIDTH,
  SERVICE_PRICE_PER_PRODUCT,
} from "@/shared/constants";
import { Icon, TextMain, TextSub } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { commaToNum } from "@/shared/utils/sumUp";
import {
  closeBottomSheet,
  openBottomSheet,
  setProductToAdd,
} from "@/features/reduxSlices/bottomSheetSlice";
import { selectFilteredSortedProducts } from "@/features/reduxSlices/filteredPSlice";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { icons } from "@/shared/iconSource";

interface IProductCardItem {
  item: IProductData;
  itemSize: number;
  badgeText?: string;
  showPlatformNm?: boolean;
  style?: ViewStyle;
  flatListRef?: RefObject<Animated.FlatList<IProductData>>;
}

const ProductItem = ({
  item,
  itemSize,
  showPlatformNm = true,
  style = {},
  flatListRef,
}: IProductCardItem) => {
  // redux
  const dispatch = useAppDispatch();
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const productToAdd = useAppSelector((state) => state.bottomSheet.product.add);
  const products = useAppSelector(selectFilteredSortedProducts);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx];
  const dDData = dTOData?.[currentDietNo]?.dietDetail || [];
  const isIncluded = dDData.some(
    (detail) => detail.productNo === item.productNo
  );

  // etc
  const isSelected = productToAdd[0]?.productNo === item.productNo;

  const onItemPressed = () => {
    // dispatch(setProductToAdd([item]));
    // dispatch(openBottomSheet("productToAddSelect"));
    if (isSelected) {
      dispatch(closeBottomSheet());
      dispatch(setProductToAdd([]));
      return;
    }

    const idx = products.findIndex(
      (product) => product.productNo === item.productNo
    );
    const i = Math.floor(idx / 2);
    !!flatListRef &&
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: i,
          viewPosition: 0.2,
        });
      }, 200);
    dispatch(setProductToAdd([item]));
    dispatch(openBottomSheet("productToAddSelect"));
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
      onPress={onItemPressed}
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
      <OpacityBox
        style={{
          display: isIncluded ? "flex" : "none",
        }}
      >
        <Icon source={icons.cartWhite_40} size={20} />
      </OpacityBox>
    </Box>
  );
};

export default ProductItem;

const Box = styled.TouchableOpacity<{ isSelected: boolean }>`
  border-radius: 5px;
  padding: 4px;
  border-width: ${({ isSelected }) => (isSelected ? 1 : 0)}px;
  border-color: ${({ isSelected }) =>
    isSelected ? colors.lineLight : colors.white};
  justify-content: center;
  align-items: center;
`;

const OpacityBox = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  border-radius: 5px;
  background-color: ${colors.blackOpacity30};
  align-items: center;
  justify-content: center;
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
