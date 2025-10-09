import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import styled from "styled-components/native";
import { Image } from "react-native";
import Icon from "@/shared/ui/Icon";
import { ENV } from "@/shared/constants";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { snapBS } from "@/features/reduxSlices/bottomSheetSlice";
import { scrollCarouselTo } from "@/features/reduxSlices/formulaSlice";

interface DietCardProps {
  dietNo: string;
  label: string;
  regrouped: Record<string, IDietDetailProductData[]>;
  sellers: string[];
  qty: number;
  isChanged: boolean;
  onMinus: (dietNo: string) => void;
  onPlus: (dietNo: string) => void;
}

const DietCard = ({
  dietNo,
  label,
  regrouped,
  sellers,
  qty,
  isChanged,
  onMinus,
  onPlus,
}: DietCardProps) => {
  // redux
  const dispatch = useAppDispatch();

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const menuIdx = Object.keys(dTOData || {}).indexOf(dietNo);

  const isEmpty = sellers.length === 0;
  const moveToMenu = () => {
    dispatch(
      snapBS({
        index: 0,
        bsNm: "summaryInfo",
        from: "DietCard.tsx",
      })
    );
    setTimeout(() => {
      dispatch(scrollCarouselTo({ index: menuIdx, from: "DietCard.tsx" }));
    }, 300);
  };

  return (
    <Card>
      <HeaderRow isEmpty={isEmpty}>
        <QtyBtn onPress={() => onMinus(dietNo)} disabled={isEmpty}>
          <Icon
            boxSize={32}
            iconSize={20}
            name="minusSquare"
            color={qty <= 1 ? colors.inactive : colors.white}
          />
        </QtyBtn>
        <MenuBtn onPress={moveToMenu}>
          <DietTitle>{label}</DietTitle>
          <QtyValue isChanged={isChanged}>{`x${qty}`}</QtyValue>
        </MenuBtn>
        <QtyBtn onPress={() => onPlus(dietNo)} disabled={isEmpty}>
          <Icon
            boxSize={32}
            iconSize={20}
            name="plusSquare"
            color={qty >= 10 ? colors.inactive : colors.white}
          />
        </QtyBtn>
      </HeaderRow>
      {sellers.length === 0 ? (
        <EmptyBtn onPress={moveToMenu}>
          <EmptyText>식품을 추가해봐요</EmptyText>
        </EmptyBtn>
      ) : (
        <Col style={{ marginTop: 24, rowGap: 20 }}>
          {sellers.map((seller) => {
            const products = regrouped[seller] || [];
            return (
              <Col key={seller} style={{ rowGap: 12 }}>
                <Row style={{ columnGap: 8 }}>
                  <SellerName>{seller}</SellerName>
                </Row>
                {products.map((p: IDietDetailProductData) => (
                  <ProductRow key={p.productNo}>
                    <ThumbWrapper>
                      {p.mainAttUrl ? (
                        <Thumb
                          source={{ uri: `${ENV.BASE_URL}${p.mainAttUrl}` }}
                        />
                      ) : (
                        <ThumbPlaceholder />
                      )}
                    </ThumbWrapper>
                    <Col style={{ flex: 1, rowGap: 2 }}>
                      <ProductName numberOfLines={1} ellipsizeMode="tail">
                        {p.productNm}
                      </ProductName>
                      <Price>{Number(p.price).toLocaleString()}원</Price>
                    </Col>
                  </ProductRow>
                ))}
              </Col>
            );
          })}
        </Col>
      )}
    </Card>
  );
};

export default DietCard;

const Card = styled.View`
  width: 100%;
  background-color: ${colors.blackOpacity50};
  padding: 24px 16px;
  border-radius: 16px;
`;
const HeaderRow = styled(Row)<{ isEmpty?: boolean }>`
  align-items: center;
  justify-content: ${({ isEmpty }) => (isEmpty ? "center" : "space-between")};
  height: 32px;
`;
const QtyBtn = styled.TouchableOpacity`
  display: ${({ disabled }) => (disabled ? "none" : "flex")};
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;
const DietTitle = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  font-weight: bold;
  color: ${colors.white};
`;
const QtyValue = styled(TextSub)<{ isChanged?: boolean }>`
  font-size: ${({ isChanged }) => (isChanged ? "14px" : "12px")};
  line-height: 18px;
  font-weight: ${({ isChanged }) => (isChanged ? "bold" : "normal")};
  color: ${({ isChanged }) => (isChanged ? colors.green : colors.white)};
`;
const SellerName = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 2px;
  color: ${colors.textSub};
`;
const ProductRow = styled(Row)`
  align-items: center;
  column-gap: 8px;
`;
const ThumbWrapper = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background-color: ${colors.blackOpacity80};
`;
const Thumb = styled(Image)`
  width: 100%;
  height: 100%;
`;
const ThumbPlaceholder = styled.View`
  flex: 1;
  background-color: ${colors.line};
`;
const ProductName = styled(TextMain)`
  font-size: 12px;
  line-height: 14px;
  color: ${colors.white};
`;
const Price = styled(TextSub)`
  font-size: 12px;
  line-height: 14px;
  color: ${colors.textSub};
`;

const MenuBtn = styled.TouchableOpacity`
  flex-direction: row;
  column-gap: 8px;
  align-items: center;
`;

const EmptyBtn = styled.TouchableOpacity`
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${colors.textSub};
  margin-top: 24px;
`;
