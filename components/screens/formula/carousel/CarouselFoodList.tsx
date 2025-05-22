import React, { useState } from "react";
import { FlatList } from "react-native";
import styled from "styled-components/native";
import { IDietDetailData } from "@/shared/api/types/diet";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import {
  Col,
  Icon,
  Row,
  TextMain,
  TextSub,
  VerticalSpace,
} from "@/shared/ui/styledComps";
import { commaToNum } from "@/shared/utils/sumUp";
import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";
import {
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import { useRouter } from "expo-router";

const ITEM_WIDTH = 88;
const ITEM_HEIGHT = 120;

interface ICarouselFoodList {
  data: IDietDetailData;
  carouselIdx: number;
  selectedFoods: string[];
  setSelectedFoods: React.Dispatch<React.SetStateAction<string[]>>;
}

const CarouselFoodList = ({
  data,
  carouselIdx,
  selectedFoods,
  setSelectedFoods,
}: ICarouselFoodList) => {
  // navigation
  const router = useRouter();

  // useState
  const [isCheckDelete, setIsCheckDelete] = useState(false);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietDetailMutation = useDeleteDietDetail();

  const onItemPressed = (productNo: string) =>
    setSelectedFoods((v) => {
      if (v.includes(productNo)) {
        const newArr = v.filter((item) => item !== productNo);
        if (newArr.length === 0) setIsCheckDelete(false);
        return newArr;
      }
      return [...v, productNo];
    });

  // etc
  // currentCarouselDietNo
  const currentCarouselDietNo = Object.keys(dTOData || {})[carouselIdx] || "";

  // selectedItem
  const selectedItem = data.find((item) => item.productNo === selectedFoods[0]);
  const selectedItemNm = selectedItem?.productNm || "";
  const selectedItemNutrArr = [
    Number(selectedItem?.calorie),
    Number(selectedItem?.carb),
    Number(selectedItem?.protein),
    Number(selectedItem?.fat),
  ];

  // selectedTooltipBtns
  const BTNS = [
    // delete
    {
      name: "delete",
      show: true,
      iconSource: icons.deleteRoundWhite_24,
      onPress: () => {
        setIsCheckDelete(true);
      },
    },
    // change
    {
      name: "change",
      show: selectedFoods.length === 1,
      iconSource: icons.changeRoundWhite_24,
      onPress: () => {
        router.push({
          pathname: "/Change",
          params: {
            dietNo: currentCarouselDietNo,
            productNo: selectedFoods[0],
            food: JSON.stringify(selectedItem),
          },
        });
      },
    },
    // info
    {
      name: "info",
      show: selectedFoods.length === 1,
      iconSource: icons.infoRoundWhite_24,
      onPress: () => {
        selectedItem &&
          router.push({
            pathname: "/FoodDetail",
            params: { productNo: selectedItem.productNo },
          });
      },
    },
  ];
  const activeBtns = BTNS.filter((btn) => btn.show);

  const checkDeleteConfirm = async () => {
    setIsCheckDelete(false);
    setSelectedFoods([]);
    const deleteFoods = async () => {
      const deleteMutations = selectedFoods.map((productNo) => {
        deleteDietDetailMutation.mutateAsync({
          dietNo: currentCarouselDietNo,
          productNo,
        });
      });
      await Promise.all(deleteMutations).catch((e) =>
        console.log("삭제 실패", e)
      );
    };
    await deleteFoods();
  };
  const checkDeleteCancel = () => setIsCheckDelete(false);

  return (
    <Container>
      {/* 식품 리스트 가로스크롤 */}
      {data.length === 0 ? (
        <DummyBox>
          <DummyText>근에 담긴 식품이 없어요</DummyText>
        </DummyBox>
      ) : (
        <FlatList
          data={data}
          horizontal={true}
          ItemSeparatorComponent={() => <VerticalSpace width={4} />}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedFoods.includes(item.productNo);

            return (
              <ItemBox
                style={{
                  boxShadow: isSelected
                    ? "1px 1px 5px rgba(0, 0, 0, 0.18)"
                    : "none",
                }}
                isSelected={isSelected}
                onPress={() => onItemPressed(item.productNo)}
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

      {/* 식품 선택한 경우 식품 정보 및 삭제, 교체, 정보 버튼 */}
      {selectedFoods.length > 0 && !isCheckDelete && (
        <SelectedInfoRow>
          <Col style={{ flex: 1 }}>
            <Row>
              <SelectedText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1 }}
              >
                {selectedItemNm}
              </SelectedText>
              {selectedFoods.length > 1 && (
                <SelectedText> (외 {selectedFoods.length - 1}개)</SelectedText>
              )}
            </Row>
            <NutrText>
              칼로리: {selectedItemNutrArr[0]}kcal 탄: {selectedItemNutrArr[1]}g
              단: {selectedItemNutrArr[2]}g 지: {selectedItemNutrArr[3]}g
            </NutrText>
          </Col>

          {/* 삭제, 교체, 정보 버튼 */}
          <Row style={{ columnGap: 8 }}>
            {activeBtns.map((btn) => (
              <SmallBtn key={btn.name} onPress={btn.onPress}>
                <Icon size={24} source={btn.iconSource} />
              </SmallBtn>
            ))}
          </Row>
        </SelectedInfoRow>
      )}

      {/* 삭제버튼 눌렀을 때 기존 알럿 대신 한 번 더 확인 */}
      {selectedFoods.length > 0 && isCheckDelete && (
        <DeleteCheckBox>
          <Col
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <SelectedText
              style={{ textAlign: "center", fontWeight: "normal" }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedItemNm}
            </SelectedText>
            <SelectedText style={{ textAlign: "center", fontWeight: "normal" }}>
              {(selectedFoods.length > 1 &&
                `(외${selectedFoods.length - 1}개) 를 `) ||
                ""}
              현재 근에서 제외합니다
            </SelectedText>
          </Col>
          <Row>
            <DeleteConfirmBtn onPress={() => checkDeleteCancel()}>
              <SelectedText>취소</SelectedText>
            </DeleteConfirmBtn>
            <DeleteConfirmBtn onPress={() => checkDeleteConfirm()}>
              <SelectedText>확인</SelectedText>
            </DeleteConfirmBtn>
          </Row>
        </DeleteCheckBox>
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
`;

const SelectedInfoRow = styled.View`
  height: 48px;
  flex-direction: row;
  background-color: ${colors.blackOpacity70};
  justify-content: space-between;
  z-index: 10;
  align-items: center;
  padding: 0 8px;
  margin-bottom: -64px;
  column-gap: 8px;
`;

const DeleteCheckBox = styled.View`
  height: 120px;
  background-color: ${colors.blackOpacity70};

  z-index: 10;
  align-items: center;
  justify-content: space-between;
  margin-bottom: -96px;
`;

const DeleteConfirmBtn = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-width: 1px;
  border-color: ${colors.line};
  justify-content: center;
  align-items: center;
`;

const SelectedText = styled(TextMain)`
  color: ${colors.white};
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
`;

const NutrText = styled(TextSub)`
  color: ${colors.inactive};
  font-size: 11px;
  line-height: 15px;
`;

const SmallBtn = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: ${colors.black};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${colors.white};
`;
