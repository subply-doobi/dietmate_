import { FlatList } from "react-native";
import styled from "styled-components/native";
import {
  IDietDetailData,
  IDietDetailProductData,
} from "@/shared/api/types/diet";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { TextMain, TextSub, VerticalSpace } from "@/shared/ui/styledComps";
import { commaToNum } from "@/shared/utils/sumUp";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setProductToDel } from "@/features/reduxSlices/bottomSheetSlice";
import { useEffect, useRef } from "react";

const ITEM_WIDTH = 88;
const ITEM_HEIGHT = 120;

interface ICarouselFoodList {
  data: IDietDetailData;
}

const CarouselFoodList = ({ data }: ICarouselFoodList) => {
  // redux
  const dispatch = useAppDispatch();
  const pToDel = useAppSelector((state) => state.bottomSheet.product.del);

  // ref
  const flatListRef = useRef<FlatList<IDietDetailProductData>>(null);

  const onItemPressed = (product: IDietDetailProductData) => {
    const isIncluded = pToDel.some((p) => p.productNo === product.productNo);
    const newArr = isIncluded
      ? pToDel.filter((p) => p.productNo !== product.productNo)
      : [...pToDel, product];
    dispatch(setProductToDel(newArr));
    setTimeout(() => {
      flatListRef.current?.scrollToItem({
        item: product,
        viewPosition: 0.5,
      });
    }, 100);
  };

  useEffect(() => {
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [data.length]);

  return (
    <Container>
      {/* 식품 리스트 가로스크롤 */}
      {data.length === 0 ? (
        <DummyBox>
          <DummyText>근에 담긴 식품이 없어요</DummyText>
        </DummyBox>
      ) : (
        <FlatList
          ref={flatListRef}
          data={data}
          horizontal={true}
          ItemSeparatorComponent={() => <VerticalSpace width={4} />}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => {
            const isSelected = pToDel.some(
              (p) => p.productNo === item.productNo
            );

            return (
              <ItemBox
                style={{
                  boxShadow: isSelected
                    ? "1px 1px 5px rgba(0, 0, 0, 0.18)"
                    : "none",
                }}
                isSelected={isSelected}
                onPress={() => onItemPressed(item)}
              >
                <PlatformNm numberOfLines={1} ellipsizeMode="tail">
                  {item.platformNm}
                </PlatformNm>
                <ThumbnailImg
                  source={{ uri: `${ENV.BASE_URL}${item.mainAttUrl}` }}
                  resizeMode="cover"
                />
                <PriceText>
                  {commaToNum(parseInt(item.price) + SERVICE_PRICE_PER_PRODUCT)}{" "}
                  원
                </PriceText>
              </ItemBox>
            );
          }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      )}
    </Container>
  );
};

export default CarouselFoodList;

const Container = styled.View`
  width: 100%;
  height: ${ITEM_HEIGHT}px;
  margin-top: 16px;
`;

const DummyBox = styled.View`
  height: ${ITEM_HEIGHT}px;
  border-radius: 5px;
  border-width: 1px;
  border-color: ${colors.lineLight};
  margin: 0 16px;
  justify-content: center;
  align-items: center;
`;

const DummyText = styled(TextSub)`
  font-size: 16px;
  line-height: 24px;
`;

const ItemBox = styled.TouchableOpacity<{
  isSelected: boolean;
}>`
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 4px;
  padding: 4px;
  border-width: ${({ isSelected }) => (isSelected ? "0.5px" : "0px")};
  border-color: ${colors.lineLight};
  align-items: center;
`;

const PlatformNm = styled(TextSub)`
  font-size: 11px;
  line-height: 16px;
  align-self: flex-start;
  padding-left: 2px;
`;

const ThumbnailImg = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 5px;
`;

const PriceText = styled(TextMain)`
  font-size: 11px;
  line-height: 16px;
  align-self: flex-end;
  padding-right: 2px;
`;
