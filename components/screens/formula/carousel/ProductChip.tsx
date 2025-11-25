import styled from "styled-components/native";
import colors from "@/shared/colors";
import { TextMain, Col, TextSub } from "@/shared/ui/styledComps";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import Icon from "@/shared/ui/Icon";

interface IProductChipProps {
  product: IDietDetailProductData;
  selected?: boolean;
  onPress?: () => void;
  size?: number | `${number}%` | number;
}

const ProductChip = ({
  product,
  selected,
  onPress,
  size,
}: IProductChipProps) => {
  const displayPrice =
    parseInt(product.price || "0", 10) + SERVICE_PRICE_PER_PRODUCT;
  const formattedPrice = displayPrice
    .toString()
    .replace(/\B(?<!\.\.\d*)(?=(\d{3})+(?!\d))/g, ",");

  const sizeStyle =
    typeof size === "number"
      ? { width: size }
      : typeof size === "string" && size
      ? { width: size as `${number}%` }
      : undefined;

  return (
    <ChipTouchable onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <ChipBox selected={!!selected} style={[{ ...sizeStyle }]}>
        <ThumbnailImg
          source={{ uri: `${ENV.BASE_URL}${product.mainAttUrl}` }}
          resizeMode="cover"
        />
        <NameText numberOfLines={2} ellipsizeMode="tail">
          {product.productNm || "-"}
        </NameText>
        <PriceText>{formattedPrice}원</PriceText>
        {selected && (
          <OpacityBox>
            <Icon
              name="checkbox"
              color={colors.green}
              boxSize={24}
              iconSize={18}
              style={{ position: "absolute", top: 2, right: 2 }}
            />
          </OpacityBox>
        )}
      </ChipBox>
    </ChipTouchable>
  );
};

export default ProductChip;

const ChipTouchable = styled.TouchableOpacity`
  flex: 1;
`;

const ChipBox = styled.View<{
  selected: boolean;
}>`
  flex: 1;
  border-radius: 4px;
  background-color: ${colors.white};
  /* border-width: ${(p) => (p.selected ? "0.5px" : "0px")};
  border-color: ${(p) => (p.selected ? colors.main : colors.lineLight)}; */
  align-items: center;
  row-gap: 4px;
`;
const OpacityBox = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  aspect-ratio: 1;
  border-radius: 4px;
  background-color: ${colors.blackOpacity50};
  align-items: center;
  justify-content: center;
`;

const ThumbnailImg = styled.Image`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
`;

const NameText = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  align-self: flex-start;
  padding-left: 2px;
`;

const PriceText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  align-self: flex-end;
  padding-right: 2px;
`;
