import styled from "styled-components/native";
import colors from "@/shared/colors";
import { Row, TextMain } from "@/shared/ui/styledComps";
import ProductChip from "./ProductChip";
import { IDietDetailProductData } from "@/shared/api/types/diet";

interface ISellerSectionProps {
  sellerName: string;
  products: IDietDetailProductData[];
  selectedProducts: IDietDetailProductData[];
  onProductPress?: (product: IDietDetailProductData) => void;
}

const SellerSection = ({
  sellerName,
  products,
  selectedProducts,
  onProductPress,
}: ISellerSectionProps) => {
  return (
    <SectionContainer>
      <SellerHeader>
        <SellerName>{sellerName}</SellerName>
      </SellerHeader>
      <ProductsRow>
        {products.map((product) => {
          const isSelected = selectedProducts.some(
            (p) => p.productNo === product.productNo
          );
          return (
            <ProductChip
              key={product.productNo}
              size={products.length === 1 ? "75%" : undefined}
              product={product}
              selected={isSelected}
              onPress={() => onProductPress && onProductPress(product)}
            />
          );
        })}
      </ProductsRow>
    </SectionContainer>
  );
};

export default SellerSection;

const SectionContainer = styled.View`
  padding: 0px 16px;
  row-gap: 8px;
`;

const SellerHeader = styled(Row)`
  align-items: center;
  justify-content: space-between;
`;

const SellerName = styled(TextMain)`
  font-size: 11px;
  font-weight: bold;
  line-height: 16px;
  color: ${colors.textSub};
`;

const ProductsRow = styled(Row)`
  flex: 1;
  column-gap: 4px;
  row-gap: 4px;
`;
