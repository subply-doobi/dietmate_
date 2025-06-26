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
import { Col, TextMain, TextSub } from "@/shared/ui/styledComps";
import { commaToNum } from "@/shared/utils/sumUp";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import colors from "@/shared/colors";

import { showProductSelectToast } from "@/shared/store/toastStore";
import { ViewStyle } from "react-native";
import { setAutoAddFood } from "@/features/reduxSlices/formulaSlice";

interface IProductCardSection {
  title?: string;
  products: IProductData[];
  subTitle?: string;
  badgeText?: string;
  horizontalScroll?: boolean;
  itemSize?: number;
  paddingHorizontal?: number;
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

const HorizontalFoodlist = ({
  title,
  subTitle,
  products = [],
  paddingHorizontal,
  badgeText,
  itemSize = (SCREENWIDTH - 32 - 16) / 3,
  gap = 8,
  showPlatformNm = true,
}: IProductCardSection) => {
  return (
    <Col>
      <Col style={{ marginLeft: paddingHorizontal ?? 16 }}>
        {title && <SectionTitle>{title}</SectionTitle>}
        {subTitle && <SectionSubTitle>{subTitle}</SectionSubTitle>}
      </Col>

      <FlatList
        data={products}
        keyExtractor={(item) => item.productNo}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: paddingHorizontal ?? 16,
          columnGap: gap,
        }}
        renderItem={({ item, index }) => {
          return (
            <ProductCardItem
              item={item}
              itemSize={itemSize}
              badgeText={badgeText}
              showPlatformNm={showPlatformNm}
            />
          );
        }}
        // ItemSeparatorComponent={() => <View style={{ width: gap }} />}
      />
    </Col>
  );
};
export default HorizontalFoodlist;

// --- Styled-components (same as your file) ---

const SectionTitle = styled(TextMain)`
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.5px;
  margin-left: 4px;
`;

const SectionSubTitle = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.5px;
  margin-top: 2px;
  margin-bottom: 12px;
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
