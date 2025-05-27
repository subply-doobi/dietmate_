// RN, expo
import { ImageSourcePropType, ScrollView } from "react-native";
import { useMemo } from "react";

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
import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import {
  commaToNum,
  getSortedShippingPriceObj,
  sumUpDietFromDTOData,
} from "@/shared/utils/sumUp";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import colors from "@/shared/colors";
import { setAutoAddSelectedFood } from "@/features/reduxSlices/formulaSlice";
import { showProductSelectToast } from "@/shared/store/toastStore";
import { icons } from "@/shared/iconSource";
import { useListDietTotalObj } from "@/shared/api/queries/diet";

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
}
const ProductCardItem = ({
  item,
  itemSize,
  showPlatformNm = true,
}: IProductCardItem) => {
  // redux
  const dispatch = useAppDispatch();
  const selectedFood = useAppSelector(
    (state) => state.formula.autoAddSelectedFood
  );

  // etc
  const isSelected = selectedFood?.productNo === item.productNo;

  const onPress = () => {
    if (isSelected) {
      Toast.hide();
      setTimeout(() => {
        dispatch(setAutoAddSelectedFood(undefined));
      }, 150);
      return;
    }
    dispatch(setAutoAddSelectedFood(item));
    showProductSelectToast();
  };

  return (
    <Box
      isSelected={isSelected}
      style={{
        width: itemSize,
        boxShadow: isSelected ? "1px 2px 3px rgba(0, 0, 0, 0.12)" : "none",
      }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {showPlatformNm && <PlatformNm>{item.platformNm}</PlatformNm>}
      <Thumbnail
        source={{ uri: `${ENV.BASE_URL}${item.mainAttUrl}` }}
        style={{
          width: itemSize - 8,
          height: itemSize - 8,
        }}
      />
      <Price style={{ alignSelf: "flex-end", marginRight: 2 }}>
        {commaToNum(parseInt(item.price) + SERVICE_PRICE_PER_PRODUCT)}원
      </Price>
      {/* {badgeText && <ModernBadge>{badgeText}</ModernBadge>} */}
    </Box>
  );
};

const ProductCardSection = ({
  title,
  subTitle,
  products = [],
  badgeText,
  horizontalScroll = false,
  itemSize = (SCREENWIDTH - 32 - 16) / 3,
  gap = 8,
  showPlatformNm = true,
  iconSource,
}: IProductCardSection) =>
  products.length > 0 && (
    <Section>
      {title && (
        <Row style={{ paddingLeft: 4, columnGap: 4 }}>
          <SectionTitle>{title}</SectionTitle>
          {iconSource && <Icon source={iconSource} size={24} />}
        </Row>
      )}
      {subTitle && <SectionSubTitle>{subTitle}</SectionSubTitle>}
      {horizontalScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{
            paddingBottom: 3,
          }}
        >
          <Row style={{ width: "100%", columnGap: gap }}>
            {products.map((item) => (
              <ProductCardItem
                key={item.productNo}
                item={item}
                itemSize={itemSize}
                badgeText={badgeText}
                showPlatformNm={showPlatformNm}
              />
            ))}
          </Row>
        </ScrollView>
      ) : (
        <Grid style={{ gap: gap }}>
          {products.map((item) => (
            <ProductCardItem
              key={item.productNo}
              item={item}
              itemSize={itemSize}
              badgeText={badgeText}
              showPlatformNm={showPlatformNm}
            />
          ))}
        </Grid>
      )}
    </Section>
  );

export const RandomProductsSection = () => {
  const products =
    useAppSelector((state) => state.filteredProduct.randomFoods) || [];
  return (
    <ProductCardSection title="선택장애는 이제 그만!" products={products} />
  );
};

export const LowShippingSection = () => {
  // redux
  const products =
    useAppSelector((state) => state.filteredProduct.lowShippingFoods) || [];
  const selectedFood = useAppSelector(
    (state) => state.formula.autoAddSelectedFood
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const { remainPrice, platformNm } = useMemo(() => {
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);
    const closestShipping =
      getSortedShippingPriceObj(shippingPriceObj)?.notFree[0];
    const remainPrice = closestShipping?.remainPrice;
    const platformNm = closestShipping?.platformNm;

    return {
      remainPrice,
      platformNm,
    };
  }, [dTOData]);

  const isAvailable = selectedFood && remainPrice && platformNm;
  const expectedShippingPrice = isAvailable
    ? remainPrice - parseInt(selectedFood.price)
    : 0;
  let shippingText = "";
  if (isAvailable) {
    shippingText =
      expectedShippingPrice >= 0
        ? `${platformNm}: ${commaToNum(
            expectedShippingPrice
          )}원 더 담으면 무료배송!`
        : `${platformNm}: 무료배송!`;
  } else {
    shippingText = `${platformNm}: ${commaToNum(
      remainPrice
    )}원 더 담으면 무료배송!`;
  }

  return (
    <ProductCardSection
      title={`배송비를 낮춰봐요!`}
      subTitle={shippingText}
      products={products}
      horizontalScroll
      showPlatformNm={false}
      itemSize={SCREENWIDTH * 0.4}
    />
  );
};

export const RecentOpenedSection = () => {
  const products =
    useAppSelector((state) => state.filteredProduct.recentFoods) || [];
  return (
    <ProductCardSection
      title="최근 보거나 추가했던 제품들이에요"
      products={products}
      horizontalScroll
      itemSize={80}
    />
  );
};

export const LikeFoodsSection = () => {
  const products =
    useAppSelector((state) => state.filteredProduct.likeFoods) || [];
  return (
    <ProductCardSection
      title="찜한 제품들이에요"
      products={products}
      itemSize={(SCREENWIDTH - 32 - 8) / 2}
      gap={8}
    />
  );
};

export const RecentOrderSection = () => {
  const products =
    useAppSelector((state) => state.filteredProduct.recentOrderFoods) || [];
  return (
    <ProductCardSection
      title="최근 주문했던 제품이에요"
      products={products}
      badgeText="주문완료"
      horizontalScroll
    />
  );
};

export const OthersSection = () => {
  const products =
    useAppSelector((state) => state.filteredProduct.others) || [];
  return (
    <ProductCardSection
      title="이런 제품도 있어요"
      products={products}
      itemSize={(SCREENWIDTH - 32 - 8) / 2}
      gap={8}
    />
  );
};

export const ExcessFoodsSection = () => {
  const products =
    useAppSelector((state) => state.filteredProduct.excessFoods) || [];
  return (
    <ProductCardSection
      title={"여기서부터는 목표영양이 초과될 가능성이 있어요..."}
      products={products}
      itemSize={(SCREENWIDTH - 32 - 16) / 3}
      gap={8}
    />
  );
};

// --- Styled-components (same as your file) ---
const Section = styled.View`
  width: 100%;
  margin-bottom: 64px;
`;

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

const Grid = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
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

const Price = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 2px;
`;

const PlatformNm = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  width: 100%;
  text-align: left;
`;

const SelectedInfoRow = styled.View`
  height: 48px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.blackOpacity70};
  z-index: 10;
  align-items: center;
  padding: 0 8px;
  column-gap: 8px;
`;
