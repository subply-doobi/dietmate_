import styled from "styled-components/native";
import { ENV } from "@/shared/constants";
import { TextSub } from "@/shared/ui/styledComps";
import { IDietDetailData } from "@/shared/api/types/diet";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import colors from "@/shared/colors";
import { closeBS } from "@/features/reduxSlices/bottomSheetSlice";
import {
  addToRecentProduct,
  getRecentProducts,
} from "@/shared/utils/asyncStorage";
import { setRecentlyOpenedFoodsPNoArr } from "@/features/reduxSlices/filteredPSlice";
import { useRouter } from "expo-router";

const ProductSelectFoodlist = ({ foods }: { foods: IDietDetailData }) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const { add: pToAdd, del: pToDel } = useAppSelector(
    (state) => state.bottomSheet.product
  );

  const onItemPressed = async (productNo: string) => {
    dispatch(closeBS());

    await addToRecentProduct(pToAdd[0]?.productNo);
    const recentlyOpenedFoodsPNoArr = await getRecentProducts();
    dispatch(setRecentlyOpenedFoodsPNoArr(recentlyOpenedFoodsPNoArr));

    setTimeout(() => {
      router.push({
        pathname: "/FoodDetail",
        params: { productNo, type: "infoOnly" },
      });
    }, 200);
  };

  return (
    <Container>
      <CurrentMenuBox
        style={{
          justifyContent: foods.length === 0 ? "center" : "flex-start",
        }}
      >
        {foods.length === 0 && <EmptyText>식품을 추가해봐요</EmptyText>}
        {foods.map((f) => {
          const isIncluded = f.productNo === pToAdd[0]?.productNo;
          const isToDel = f.productNo === pToDel[0]?.productNo;
          const opacityVisible = isIncluded || isToDel;
          const opacityText = isIncluded ? "삭제" : "교체";
          return (
            <ItemBox
              key={f.productNo}
              onPress={() => onItemPressed(f.productNo)}
            >
              <ThumbnailImg
                source={{ uri: `${ENV.BASE_URL}${f.mainAttUrl}` }}
                resizeMode="cover"
              />
              {opacityVisible && (
                <OpacityBox>
                  <OpacityText>{opacityText}</OpacityText>
                </OpacityBox>
              )}
            </ItemBox>
          );
        })}
      </CurrentMenuBox>
    </Container>
  );
};

export default ProductSelectFoodlist;

const Container = styled.View`
  width: 100%;
  height: 52px;
  flex-direction: row;
  column-gap: 4px;
`;

const CurrentMenuBox = styled.View`
  flex: 1;
  flex-direction: row;
  border-radius: 4px;
  align-items: center;
  gap: 8px;
`;

const OpacityBox = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 52px;
  border-radius: 4px;
  background-color: ${colors.blackOpacity70};
  align-items: center;
  justify-content: center;
`;

const OpacityText = styled(TextSub)`
  color: ${colors.white};
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
`;

const ItemBox = styled.TouchableOpacity`
  align-items: center;
`;
const SelectedItemBox = styled.View`
  align-items: center;
`;

const EmptyText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;

const ThumbnailImg = styled.Image`
  width: 52px;
  height: 52px;
  border-radius: 5px;
`;
