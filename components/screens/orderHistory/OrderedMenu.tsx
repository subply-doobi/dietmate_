// RN
import { ScrollView } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { IOrderedProduct } from "@/shared/api/types/order";
import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";
import { commaToNum, sumUpNutrients } from "@/shared/utils/sumUp";
import { Row, Col, VerticalLine, TextMain } from "@/shared/ui/styledComps";

const OrderedMenu = ({ order }: { order: IOrderedProduct[][] }) => {
  return (
    <Row>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <ArrowImage source={icons.arrowLeft_20} />
        {/* 주문 내 끼니 별 반복 */}
        {order.map((menu, menuIdx) => (
          <Col key={menuIdx}>
            <CaloriesText>
              {commaToNum(sumUpNutrients(menu).cal)} kcal
            </CaloriesText>
            <Row
              style={{
                marginTop: 8,
                columnGap: 8,
              }}
            >
              {/* 끼니 내 식품 별 반복 */}
              {menu.map((product: any, productIdx: number) => (
                <ThumbnailImage
                  key={productIdx}
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_BASE_URL}${product.mainAttUrl}`,
                  }}
                />
              ))}
              {menuIdx !== order.length - 1 && (
                <VerticalLine
                  style={{
                    backgroundColor: colors.lineLight,
                    marginLeft: 8,
                    marginRight: 16,
                  }}
                />
              )}
            </Row>
          </Col>
        ))}
        <ArrowImage source={icons.arrowRight_20} />
      </ScrollView>
    </Row>
  );
};

export default OrderedMenu;

const CaloriesText = styled(TextMain)`
  margin-top: 8px;
  font-size: 14px;
`;

const ThumbnailImage = styled.Image`
  background-color: ${colors.backgroundLight};
  width: 80px;
  height: 80px;
  border-radius: 2px;
`;
const ArrowImage = styled.Image`
  align-self: center;
  margin-top: 28px;
  width: 20px;
  height: 20px;
`;
