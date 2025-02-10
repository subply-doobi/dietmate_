// RN, expo
import { SetStateAction } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import { icons } from "@/shared/iconSource";
import colors from "@/shared/colors";
import { commaToNum } from "@/shared/utils/sumUp";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";

import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import DAlert from "@/shared/ui/DAlert";
import DeleteAlertContent from "../modal/alert/DeleteAlertContent";
import DTooltip from "@/shared/ui/DTooltip";
import { useRouter } from "expo-router";

interface IFoodList {
  selectedFoods: { [key: string]: string[] };
  setSelectedFoods: React.Dispatch<SetStateAction<{ [key: string]: string[] }>>;
  dietNo: string;
}

const FoodList = ({ selectedFoods, setSelectedFoods, dietNo }: IFoodList) => {
  // redux
  const dispatch = useAppDispatch();

  // navigation
  const router = useRouter();

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const dietDetailData = dTOData?.[dietNo]?.dietDetail ?? [];
  const deleteMutation = useDeleteDietDetail();

  // etc
  const addToSelected = (productNo: string) => {
    const newArr = selectedFoods[dietNo]
      ? [...selectedFoods[dietNo], productNo]
      : [productNo];
    const newObj = {
      ...selectedFoods,
      [dietNo]: newArr,
    };
    setSelectedFoods(newObj);
  };
  const deleteFromSelected = (productNo: string) => {
    const newObj = {
      ...selectedFoods,
      [dietNo]: [...selectedFoods[dietNo]?.filter((v) => v !== productNo)],
    };
    setSelectedFoods(newObj);
  };

  return (
    <Container>
      {dietDetailData?.map((food, idx) => {
        const isSelected = selectedFoods[dietNo]?.includes(food.productNo);
        const hasNoStock = food.statusCd === "SP012001" ? false : true;
        return (
          <FoodBox key={idx}>
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
              {isSelected && (
                <SelectedCheckImage source={icons.checkboxCheckedGreen_24} />
              )}

              {/* 식품정보 */}
              <SelectBtn
                onPress={() =>
                  isSelected
                    ? deleteFromSelected(food.productNo)
                    : addToSelected(food.productNo)
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

              <RightBtnBox>
                <DeleteBtn
                  onPress={() => {
                    dispatch(
                      openModal({
                        name: "productDeleteAlert",
                        values: { productNoToDelArr: [food.productNo] },
                      })
                    );
                  }}
                >
                  <Icon source={icons.cancelRound_24} />
                </DeleteBtn>
                <ChangeBtn
                  onPress={() => {
                    router.push({
                      pathname: "/Change",
                      params: {
                        dietNo,
                        productNo: food.productNo,
                        food: JSON.stringify(food),
                      },
                    });
                  }}
                >
                  <Icon source={icons.changeRound_24} />
                </ChangeBtn>
              </RightBtnBox>
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
  margin-top: 24px;
  row-gap: 20px;
`;

const FoodBox = styled.View`
  width: 100%;
  height: 104px;
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
  margin: 0 8px;
`;

const SelectedCheckImage = styled.Image`
  position: absolute;

  width: 24px;
  height: 24px;
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
  border-radius: 5px;
  border-width: 1px;
  border-color: ${colors.lineLight};
  z-index: 2;
`;

const DeleteBtn = styled.TouchableOpacity`
  width: 100%;
  height: 50%;
  justify-content: center;
  align-items: center;
  background-color: ${colors.white};
`;

const ChangeBtn = styled.TouchableOpacity`
  width: 100%;
  height: 50%;
  background-color: ${colors.white};
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
