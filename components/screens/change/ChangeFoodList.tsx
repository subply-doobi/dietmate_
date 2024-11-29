import React from "react";
import styled from "styled-components/native";
import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { IProductData } from "@/shared/api/types/product";
import { commaToNum } from "@/shared/utils/sumUp";
import { SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/shared/iconSource";
import { useRouter } from "expo-router";

interface IChangeFoodList {
  food: IProductData;
  selectedProduct: IProductData | undefined;
  setSelectedProduct: React.Dispatch<
    React.SetStateAction<IProductData | undefined>
  >;
}
const ChangeFoodList = ({
  food,
  selectedProduct,
  setSelectedProduct,
}: IChangeFoodList) => {
  const router = useRouter();
  const isActive = selectedProduct?.productNo === food.productNo;
  return (
    <FoodBox isActive={isActive}>
      <Row
        style={{
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        {/* 식품 이미지 */}
        <FoodDetailBtn
          onPress={() => {
            router.push({
              pathname: "/FoodDetail",
              params: { productNo: food.productNo, from: "Change" },
            });
          }}
        >
          <ThumbnailImage
            source={{
              uri: `${process.env.EXPO_PUBLIC_BASE_URL}${food.mainAttUrl}`,
            }}
            resizeMode="center"
          />
        </FoodDetailBtn>

        {/* 식품정보 */}
        <SelectBtn
          onPress={() =>
            setSelectedProduct((v) =>
              !v ? food : v.productNo === food.productNo ? undefined : food
            )
          }
        >
          <Row style={{ justifyContent: "space-between" }}>
            <SellerText>{food.platformNm}</SellerText>
          </Row>
          <ProductNmText numberOfLines={1} ellipsizeMode="tail">
            {food.productNm}
          </ProductNmText>

          {/* 영양정보 */}
          <NutrientBox>
            <NutrientText>
              칼로리{" "}
              <NutrientValue>{parseInt(food.calorie)} kcal</NutrientValue>
            </NutrientText>
            <Row style={{ columnGap: 8 }}>
              <NutrientText>
                탄 <NutrientValue>{parseInt(food.carb)} g</NutrientValue>
              </NutrientText>
              <NutrientText>
                단 <NutrientValue>{parseInt(food.protein)} g</NutrientValue>
              </NutrientText>
              <NutrientText>
                지 <NutrientValue>{parseInt(food.fat)} g</NutrientValue>
              </NutrientText>
            </Row>
          </NutrientBox>
          <ProductPrice>
            {commaToNum(parseInt(food.price) + SERVICE_PRICE_PER_PRODUCT)}원
          </ProductPrice>
        </SelectBtn>

        <RightBtnBox>
          {isActive && (
            <Icon
              source={icons.checkRoundCheckedMain_24}
              style={{ position: "absolute", right: 0, top: 0 }}
            />
          )}
        </RightBtnBox>
      </Row>
    </FoodBox>
  );
};

export default ChangeFoodList;

interface IFoodBox {
  isActive: boolean;
}
const FoodBox = styled.View<IFoodBox>`
  width: 100%;
  height: 120px;
  justify-content: center;
  padding: 8px;

  border-radius: 5px;
  border-color: ${({ isActive }) =>
    isActive ? colors.main : colors.lineLight};
  border-width: ${({ isActive }) => (isActive ? "2px" : "1px")};
`;

const FoodDetailBtn = styled.TouchableOpacity``;

const SelectBtn = styled.TouchableOpacity`
  flex: 1;
  margin: 0 8px;
`;

const ThumbnailImage = styled.Image`
  width: 104px;
  height: 104px;
  border-radius: 5px;
`;

const SellerText = styled(TextSub)`
  margin-left: 4px;
  font-size: 11px;
`;

const RightBtnBox = styled.View`
  width: 32px;
  height: 100%;
`;

const DeleteBtn = styled.TouchableOpacity`
  width: 100%;
  height: 50%;
  justify-content: center;
  align-items: center;
`;

const ChangeBtn = styled.TouchableOpacity`
  width: 100%;
  height: 50%;
  justify-content: center;
  align-items: center;
  border-top-width: 1px;
  border-color: ${colors.lineLight};
`;

const ProductNmText = styled(TextMain)`
  margin-left: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const NutrientBox = styled.View`
  background-color: ${colors.backgroundLight};
  padding: 8px 4px;
  margin-top: 4px;
  column-gap: 12px;
`;

const NutrientText = styled(TextSub)`
  font-size: 11px;
`;
const NutrientValue = styled(TextMain)`
  font-size: 11px;
`;

const ProductPrice = styled(TextMain)`
  margin-top: 4px;
  margin-left: 4px;
  font-size: 11px;
`;
