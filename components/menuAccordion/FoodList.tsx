// RN, expo

// 3rd
import styled from "styled-components/native";

// doobi
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { commaToNum } from "@/shared/utils/sumUp";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";

import { Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import DTooltip from "@/shared/ui/DTooltip";
import { useRouter } from "expo-router";

interface IFoodList {
  dietNo: string;
}

const FoodList = ({ dietNo }: IFoodList) => {
  // redux

  // navigation
  const router = useRouter();

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const dietDetailData = dTOData?.[dietNo]?.dietDetail ?? [];

  return (
    <Container>
      {dietDetailData?.map((food, idx) => {
        const hasNoStock = food.statusCd === "SP012001" ? false : true;
        return (
          <FoodBox key={idx}>
            <Row
              style={{
                width: "100%",
                columnGap: 12,
              }}
            >
              {/* 식품 이미지 */}
              <FoodDetailBtn
                onPress={() => {
                  router.push({
                    pathname: "/FoodDetail",
                    params: { productNo: food.productNo },
                  });
                }}
              >
                <ThumbnailImage
                  source={{
                    uri: `${ENV.BASE_URL}${food.mainAttUrl}`,
                  }}
                  resizeMode="center"
                />
              </FoodDetailBtn>

              {/* 식품정보 */}
              <SelectBtn onPress={() => {}}>
                <Row style={{ justifyContent: "space-between" }}>
                  <SellerText>{food.platformNm}</SellerText>
                </Row>
                <ProductNmText numberOfLines={1} ellipsizeMode="tail">
                  {food.productNm}
                </ProductNmText>

                {/* 영양정보 */}
                <NutrientBox>
                  <Row style={{ columnGap: 8 }}>
                    <NutrientText>
                      칼{" "}
                      <NutrientValue>
                        {parseInt(food.calorie)} kcal
                      </NutrientValue>
                    </NutrientText>
                    <NutrientText>
                      탄 <NutrientValue>{parseInt(food.carb)} g</NutrientValue>
                    </NutrientText>
                    <NutrientText>
                      단{" "}
                      <NutrientValue>{parseInt(food.protein)} g</NutrientValue>
                    </NutrientText>
                    <NutrientText>
                      지 <NutrientValue>{parseInt(food.fat)} g</NutrientValue>
                    </NutrientText>
                  </Row>
                </NutrientBox>
                <ProductPrice>
                  {commaToNum(parseInt(food.price) + SERVICE_PRICE_PER_PRODUCT)}
                  원
                </ProductPrice>
              </SelectBtn>

              {hasNoStock && <OpacityBox />}
            </Row>
            <DTooltip
              tooltipShow={hasNoStock}
              text="재고가 없어요 식품을 교체하거나 삭제해주세요"
              boxTop={-16}
            />
          </FoodBox>
        );
      })}
    </Container>
  );
};

export default FoodList;

const Container = styled.View`
  width: 100%;
  row-gap: 24px;
`;

const FoodBox = styled.View`
  width: 100%;
`;

const OpacityBox = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 5px;
  z-index: 1;
  background-color: ${colors.blackOpacity70};
`;

const FoodDetailBtn = styled.TouchableOpacity``;

const SelectBtn = styled.TouchableOpacity`
  flex: 1;
`;

const ThumbnailImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 5px;
`;

const SellerText = styled(TextSub)`
  margin-left: 4px;
  font-size: 11px;
`;

const ProductNmText = styled(TextMain)`
  margin-left: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const NutrientBox = styled.View`
  background-color: ${colors.backgroundLight};
  padding: 4px;
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
  margin-top: 2px;
  margin-left: 4px;
  font-size: 11px;
`;
