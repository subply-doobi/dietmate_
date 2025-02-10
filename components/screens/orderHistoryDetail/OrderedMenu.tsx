import styled from "styled-components/native";
import { IOrderedProduct } from "../../../shared/api/types/order";
import {
  AccordionContentContainer,
  Col,
  HorizontalLine,
  HorizontalSpace,
  TextMain,
  TextSub,
} from "../../../shared/ui/styledComps";
import colors from "../../../shared/colors";
import Nutr from "./Nutr";
import { commaToNum, sumUpPrice } from "../../../shared/utils/sumUp";
import { ENV } from "@/shared/constants";

interface IOrderedMenu {
  orderDetailData: Readonly<IOrderedProduct[][]>;
}
const OrderedMenu = ({ orderDetailData }: IOrderedMenu) => {
  return (
    <AccordionContentContainer style={{ rowGap: 64 }}>
      {orderDetailData.map((order, idx) => (
        <Col key={order[0].dietNo}>
          <MenuTitle>{`끼니${idx + 1} (x${order[0].qty}개)`}</MenuTitle>
          <HorizontalLine style={{ marginTop: 8 }} />
          <HorizontalSpace height={24} />
          <Nutr
            calorie={order[0].calorie}
            carb={order[0].carb}
            protein={order[0].protein}
            fat={order[0].fat}
          />
          <HorizontalSpace height={40} />
          <MenuBox>
            {order.map((f, idx) => (
              <FoodBox key={`${f.dietNo}_${f.productNo}`}>
                <FoodImg
                  source={{
                    uri: `${ENV.BASE_URL}${f.mainAttUrl}`,
                  }}
                />
                <InfoBox>
                  <PlatformNm>{f.platformNm}</PlatformNm>
                  <ProductNm>{f.productNm}</ProductNm>
                  <NutrBox>
                    <NutrText numberOfLines={1} ellipsizeMode="tail">
                      칼로리{" "}
                      <NutrVal>{`${commaToNum(
                        parseInt(f.calorie)
                      )}kcal`}</NutrVal>{" "}
                      탄 <NutrVal>{`${commaToNum(parseInt(f.carb))}g`}</NutrVal>{" "}
                      단{" "}
                      <NutrVal>{`${commaToNum(parseInt(f.protein))}g`}</NutrVal>{" "}
                      지 <NutrVal>{`${commaToNum(parseInt(f.fat))}g`}</NutrVal>
                    </NutrText>
                  </NutrBox>
                  <Price>{commaToNum(f.price)}원</Price>
                </InfoBox>
              </FoodBox>
            ))}
          </MenuBox>
          <PriceTotal>{`합계 ${commaToNum(sumUpPrice(order))}원`}</PriceTotal>
        </Col>
      ))}
    </AccordionContentContainer>
  );
};

export default OrderedMenu;

const MenuTitle = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
`;

const MenuBox = styled.View`
  row-gap: 24px;
`;

const FoodBox = styled.View`
  flex-direction: row;
  height: 80px;
  padding: 0px 16px;
`;

const FoodImg = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 5px;
`;

const InfoBox = styled.View`
  flex: 1;
  margin-left: 12px;
  justify-content: center;
`;

const PlatformNm = styled(TextSub)`
  font-size: 11px;
  line-height: 15px;
`;

const ProductNm = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
`;

const NutrBox = styled.View`
  background-color: ${colors.backgroundLight};
  border-radius: 5px;
  padding: 4px;
  margin-top: 4px;
  margin-left: -4px;
`;

const NutrText = styled(TextSub)`
  font-size: 11px;
  line-height: 15px;
`;

const NutrVal = styled(TextMain)`
  font-size: 11px;
  line-height: 15px;
`;
const Price = styled(TextMain)`
  font-size: 11px;
  line-height: 15px;
  margin-top: 2px;
`;

const PriceTotal = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  font-weight: bold;
  align-self: flex-end;
  margin-top: 24px;
  margin-right: 16px;
`;
