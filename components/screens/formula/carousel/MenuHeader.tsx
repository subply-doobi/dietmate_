import colors from "@/shared/colors";
import { SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { commaToNum } from "@/shared/utils/sumUp";
import styled from "styled-components/native";

interface IMenuHeaderProps {
  label: string;
  products: { price?: string; qty?: string | number }[];
  qty: number | string | undefined;
}

// Sum price (product price + service fee) * qty (if provided per product) else 1
const calcTotalPrice = (
  products: { price?: string; qty?: string | number }[]
) => {
  return products.reduce((acc, cur) => {
    const base = parseInt(cur.price || "0", 10);
    const itemQty = cur.qty ? parseInt(cur.qty as string, 10) || 1 : 1;
    const unit = base + SERVICE_PRICE_PER_PRODUCT;
    return acc + unit * itemQty;
  }, 0);
};

const MenuHeader = ({ label, products, qty }: IMenuHeaderProps) => {
  const totalPrice = calcTotalPrice(products);
  return (
    <HeaderContainer>
      <Row style={{ alignItems: "flex-end", columnGap: 8 }}>
        <Title>{label}</Title>
        {Number(qty) > 1 && <SubTitle>( x{qty} )</SubTitle>}
      </Row>
      <PriceText>{commaToNum(totalPrice)}원</PriceText>
    </HeaderContainer>
  );
};

export default MenuHeader;

const HeaderContainer = styled(Row)`
  align-items: flex-end;
  column-gap: 8px;
  padding: 0 16px;
`;

const Title = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
`;

const SubTitle = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;

const PriceText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;
