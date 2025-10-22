import React from "react";
import styled from "styled-components/native";
import { Image } from "react-native";
import { Col, Row, TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import Icon from "@/shared/ui/Icon";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import { useRouter } from "expo-router";
import { IProductData } from "@/shared/api/types/product";

interface ProductRowProps {
  product: IDietDetailProductData | IProductData;
  showInfo?: boolean;
  dimmed?: boolean; // when true, cover thumbnail and dim text color
}

const ProductRow = ({
  product: p,
  showInfo = false,
  dimmed = false,
}: ProductRowProps) => {
  const router = useRouter();
  return (
    <Row style={{ alignItems: "center", columnGap: 8 }}>
      <ThumbWrapper>
        {p.mainAttUrl ? (
          <Thumb source={{ uri: `${ENV.BASE_URL}${p.mainAttUrl}` }} />
        ) : (
          <ThumbPlaceholder />
        )}
        {dimmed && <ThumbCover />}
      </ThumbWrapper>
      <Col style={{ flex: 1, rowGap: 2 }}>
        <ProductName numberOfLines={1} ellipsizeMode="tail" dimmed={dimmed}>
          {p.productNm}
        </ProductName>
        <Price>
          {(Number(p.price) + SERVICE_PRICE_PER_PRODUCT).toLocaleString()}원
        </Price>
      </Col>
      {showInfo && (
        <InfoBtn
          onPress={() =>
            router.push({
              pathname: "/FoodDetail",
              params: { productNo: p.productNo, type: "infoOnly" },
            })
          }
        >
          <Icon
            name="infoCircle"
            iconSize={18}
            boxSize={40}
            color={dimmed ? colors.textSub : colors.white}
          />
        </InfoBtn>
      )}
    </Row>
  );
};

export default ProductRow;

const InfoBtn = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  border-width: 0.5px;
  border-color: ${colors.line};
  border-radius: 4px;
`;

const ThumbWrapper = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background-color: ${colors.blackOpacity30};
`;

const Thumb = styled(Image)`
  width: 100%;
  height: 100%;
`;

const ThumbPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${colors.blackOpacity30};
`;

const ProductName = styled(TextMain)<{ dimmed?: boolean }>`
  font-size: 12px;
  line-height: 16px;
  color: ${(p) => (p.dimmed ? colors.textSub : colors.white)};
`;

const Price = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  color: ${colors.textSub};
`;

const ThumbCover = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.blackOpacity70};
`;
