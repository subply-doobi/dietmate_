import { FlatList } from "react-native";
import React from "react";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import {
  Icon,
  TextMain,
  TextSub,
  VerticalSpace,
} from "@/shared/ui/styledComps";
import styled from "styled-components/native";
import {
  IDietDetailData,
  IDietDetailProductData,
} from "@/shared/api/types/diet";
import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";
import { IProductData, IProductDetailData } from "@/shared/api/types/product";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  setProductToAdd,
  setProductToDel,
} from "@/features/reduxSlices/lowerShippingSlice";
import {
  commaToNum,
  IShippingPriceObj,
  IShippingPriceValues,
} from "@/shared/utils/sumUp";
import DTooltip from "@/shared/ui/DTooltip";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

interface IFoodlistToMod {
  type: "del" | "add";
  foods: IDietDetailData | IProductData[];
  shippingPriceObj: IShippingPriceObj;
}
const FoodlistToMod = ({ type, foods, shippingPriceObj }: IFoodlistToMod) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const productToDel = useAppSelector(
    (state) => state.lowerShipping.toastData.foodChange.productToDel
  );
  const productToAdd = useAppSelector(
    (state) => state.lowerShipping.toastData.foodChange.productToAdd
  );
  const changeAvailableFoods = useAppSelector(
    (state) =>
      state.lowerShipping.toastData.foodChange.menuWithChangeAvailableFoods
        .changeAvailableFoods
  );

  // fn
  const onItemPressed = (food: IProductData) => {
    if (type === "del") {
      if (productToDel?.productNo === food.productNo) {
        dispatch(setProductToDel(undefined));
      } else {
        dispatch(setProductToDel(food));
      }
    }
    if (type === "add") {
      if (productToAdd?.productNo === food.productNo) {
        dispatch(setProductToAdd(undefined));
      } else {
        dispatch(setProductToAdd(food));
      }
    }
  };

  return (
    <FlatList
      data={foods}
      style={{ marginTop: 16 }}
      horizontal={true}
      ItemSeparatorComponent={() => (
        <VerticalSpace width={4} style={{ backgroundColor: undefined }} />
      )}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={({ item }) => {
        // check item type is IDietDetailProductData or IProductData[] by "qty"
        const currentQty = "qty" in item ? parseInt(item.qty as string) : 1;
        const isSelected =
          item.productNo === productToDel?.productNo ||
          item.productNo === productToAdd?.productNo;

        let needInfoOpacity = false;
        let disabled = false;
        let infoText = "";

        if (type === "del") {
          const oShippingPrice =
            shippingPriceObj[item.platformNm].shippingPrice;
          const freeshippingPrice =
            shippingPriceObj[item.platformNm].freeShippingPrice;
          const ePrice =
            shippingPriceObj[item.platformNm].price -
            (parseInt(item.price) + SERVICE_PRICE_PER_PRODUCT) * currentQty;
          const eShippingPrice =
            ePrice >= freeshippingPrice ? 0 : parseInt(item.shippingPrice);

          if (oShippingPrice === 0 && eShippingPrice !== 0) {
            needInfoOpacity = true;
            infoText = `배송비 발생\n주의`;
          }

          if (changeAvailableFoods[item.productNo].length === 0) {
            needInfoOpacity = true;
            disabled = true;
            infoText = `변경 가능한\n식품이 없어요`;
          }
        }

        return (
          <ItemBox
            isSelected={isSelected}
            type={type}
            disabled={disabled}
            onPress={() => onItemPressed(item)}
          >
            <PlatformNm numberOfLines={1} ellipsizeMode="tail">
              {item.platformNm}
            </PlatformNm>
            <ThumbnailImg
              source={{ uri: `${ENV.BASE_URL}${item.mainAttUrl}` }}
              resizeMode="cover"
            />
            {isSelected && (
              <Icon
                source={
                  type === "del"
                    ? icons.deleteRoundWarning_24
                    : icons.checkRoundCheckedGreen_24
                }
                size={16}
                style={{ position: "absolute", top: 2, right: 2 }}
              />
            )}
            <PlatformNm numberOfLines={1} ellipsizeMode="tail">
              {item.productNm}
            </PlatformNm>
            <ProductNm numberOfLines={1} ellipsizeMode="tail">
              {commaToNum(Number(item.price) + SERVICE_PRICE_PER_PRODUCT)}원
            </ProductNm>
            <DTooltip
              tooltipShow={isSelected}
              color={colors.blackOpacity70}
              reversed={true}
              customContent={() => (
                <Icon source={icons.infoRoundWhite_24} size={20} />
              )}
              boxBottom={-2}
              boxRight={4}
              onPressFn={() => {
                Toast.hide();
                router.push({
                  pathname: "/FoodDetail",
                  params: { productNo: item.productNo, type: "infoOnly" },
                });
              }}
            />
            {needInfoOpacity && (
              <OpacityBox>
                <ProductNm style={{ textAlign: "center" }}>
                  {infoText}
                </ProductNm>
              </OpacityBox>
            )}
          </ItemBox>
        );
      }}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default FoodlistToMod;

const ItemBox = styled.TouchableOpacity<{
  isSelected: boolean;
  type: "del" | "add";
}>`
  width: 80px;
  border-radius: 4px;
  padding: 4px 6px;
  border-width: ${({ isSelected }) => (isSelected ? "0.5px" : "0px")};
  border-color: ${({ type }) =>
    type === "del" ? colors.warning : colors.success};
  align-items: center;
`;

const PlatformNm = styled(TextSub)`
  font-size: 11px;
  line-height: 16px;
  align-self: flex-start;
`;

const ThumbnailImg = styled.Image`
  width: 72px;
  height: 72px;
  border-radius: 5px;
`;

const ProductNm = styled(TextMain)`
  width: 100%;
  font-size: 11px;
  line-height: 16px;
  color: ${colors.white};
`;

const OpacityBox = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.blackOpacity50};
  border-radius: 4px;
  align-items: center;
  justify-content: center;
`;
