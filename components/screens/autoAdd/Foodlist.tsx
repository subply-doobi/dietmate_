// RN, expo
import { FlatList, ImageSourcePropType } from "react-native";

// 3rd
import styled from "styled-components/native";
import Toast from "react-native-toast-message";

// doobi
import { IProductData } from "@/shared/api/types/product";
import {
  ENV,
  SCREENWIDTH,
  SERVICE_PRICE_PER_PRODUCT,
} from "@/shared/constants";
import {
  Icon,
  Row,
  TextMain,
  TextSub,
  VerticalSpace,
} from "@/shared/ui/styledComps";
import {
  commaToNum,
  getSortedShippingPriceObj,
  sumUpDietFromDTOData,
} from "@/shared/utils/sumUp";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import colors from "@/shared/colors";

import { showProductSelectToast } from "@/shared/store/toastStore";
import { icons } from "@/shared/iconSource";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { ViewStyle } from "react-native";
import SortFilter from "./SortFilter";
import { setAutoAddFood } from "@/features/reduxSlices/formulaSlice";

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
  title,
  subTitle,
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

  return (
    <FlatList
      ListHeaderComponent={SortFilter}
      data={products}
      keyExtractor={(item) => item.productNo}
      horizontal={horizontalScroll}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        width: "100%",
        paddingBottom: 64,
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
      key={horizontalScroll ? "h" : "v"}
      // ItemSeparatorComponent={() => <View style={{ width: gap }} />}
    />
  );
};
export default Foodlist;

// --- Styled-components (same as your file) ---

const SectionTitle = styled(TextMain)`
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.5px;
`;

const SectionSubTitle = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.5px;
  margin-top: 2px;
  margin-left: 4px;
`;

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
