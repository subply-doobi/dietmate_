import styled from "styled-components/native";
import { IOrderedProduct } from "../../../shared/api/types/order";
import { Col, Row, TextMain, TextSub } from "../../../shared/ui/styledComps";
import { ENV } from "@/shared/constants";

interface IFoodList {
  menu: IOrderedProduct[];
}
const FoodList = ({ menu }: IFoodList) => {
  return (
    <Box>
      {menu.map((food) => (
        <Row key={food.productNo}>
          <ThumbnailImage
            source={{
              uri: `${ENV.BASE_URL}${food.mainAttUrl}`,
            }}
          />
          <Col style={{ marginLeft: 8 }}>
            <SellerText numberOfLines={1} ellipsizeMode="tail">
              {food.platformNm}
            </SellerText>
            <ProductNm numberOfLines={1} ellipsizeMode="tail">
              {food.productNm}
            </ProductNm>
          </Col>
        </Row>
      ))}
    </Box>
  );
};

export default FoodList;

const Box = styled.View`
  width: 100%;
  row-gap: 8px;
`;

const ThumbnailImage = styled.Image`
  width: 48px;
  height: 48px;
  border-radius: 5px;
`;
const SellerText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;

const ProductNm = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  margin-top: 2px;
`;
