// RN, expo
import React, { useState, useEffect, useMemo } from "react";
import {
  Text,
  ScrollView,
  SafeAreaView,
  View,
  ActivityIndicator,
} from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import NutrientsProgress from "@/components/common/nutrient/NutrientsProgress";
import BusinessInfo from "@/components/common/businessInfo/BusinessInfo";
import CtaButton from "@/shared/ui/CtaButton";
import NutrientPart from "@/components/screens/foodDetail/NutrientPart";
import FoodPart from "@/components/screens/foodDetail/FoodPart";
import ShippingPart from "@/components/screens/foodDetail/ShippingPart";
import {
  Col,
  Row,
  TextMain,
  TextSub,
  StickyFooter,
  Dot,
  Icon,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { IProductData } from "@/shared/api/types/product";

import {
  useCreateDietDetail,
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import { SCREENWIDTH, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useCreateProductMark,
  useDeleteProductMark,
  useGetProduct,
  useListProductMark,
} from "@/shared/api/queries/product";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

import { icons } from "@/shared/iconSource";
import { commaToNum, sumUpPriceOfSeller } from "@/shared/utils/sumUp";
import { tfDTOToDDA } from "@/shared/utils/dataTransform";
import {
  ITableItem,
  makeTableData,
} from "@/shared/utils/screens/foodDetail/makeNutrTable";

interface IShowPart {
  clicked: string;
  table: ITableItem[];
  data: IProductData;
}
const ShowPart = ({ clicked, table, data }: IShowPart) => {
  if (clicked === "영양성분") return <NutrientPart table={table} />;
  if (clicked === "식품상세") return <FoodPart productData={data} />;
  if (clicked === "배송정책")
    return (
      <ShippingPart platformNm={data.platformNm} platformUrl={data.link1} />
    );
  return <NutrientPart table={table} />;
};

const FoodDetail = () => {
  // redux
  const { currentDietNo } = useAppSelector((state) => state.common);

  // navigation
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();

  // react-query
  const { data: productData, refetch: refetchProduct } = useGetProduct({
    dietNo: currentDietNo,
    productNo: params.productNo as string,
  });
  const { data: likeData } = useListProductMark();
  const { data: baseLineData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const dietDetailData = dTOData?.[currentDietNo]?.dietDetail ?? [];
  const dietDetailAllData = tfDTOToDDA(dTOData);
  const createProductMarkMutation = useCreateProductMark();
  const deleteProductMarkMutation = useDeleteProductMark();
  const createDietDetailMutation = useCreateDietDetail();
  const deleteDietDetailMutation = useDeleteDietDetail();

  //state
  const [clicked, setClicked] = useState("식품상세");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const detailMenu = ["영양성분", "식품상세", "배송정책"];

  // etc
  const isIncludedInLike =
    productData &&
    likeData?.map((food) => food.productNo).includes(productData?.productNo);

  const isAddedInCurrentDiet = dietDetailData.some(
    (p) => p.productNo === params.productNo
  );

  // 식품마다 headerTitle바꾸기
  // TBD : route.params.item 타입 관련 해결 및 만약 null값일 시 에러처리
  useEffect(() => {
    const waitPage = async () => {
      setTimeout(() => setIsPageLoading(false), 500);
    };
    const initializePage = async () => {
      const initialData = (await refetchProduct()).data;
      navigation.setOptions({
        headerTitleContainerStyle: {
          flexDirection: "row",
          alignItems: "center",
          headerBackVisible: false,
        },
        headerTitle: () => {
          return (
            // -양쪽 패딩 16px -뒤로가기 36px -장바구니아이콘 36px
            <View style={{ width: SCREENWIDTH - 32 - 72 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 18,
                  color: colors.textMain,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {initialData ? initialData.productNm : ""}
              </Text>
            </View>
          );
        },
      });
    };
    waitPage();
    initializePage();
  }, [navigation]);

  const handlePressLikeBtn = () => {
    if (!productData) return;
    isIncludedInLike
      ? deleteProductMarkMutation.mutate(productData.productNo)
      : createProductMarkMutation.mutate(productData.productNo);
  };

  const handlePressAddCartBtn = () => {
    if (!productData) return;
    if (params.from === "Change") {
      navigation.goBack();
      return;
    }

    isAddedInCurrentDiet
      ? deleteDietDetailMutation.mutate({
          dietNo: currentDietNo,
          productNo: productData.productNo,
        })
      : createDietDetailMutation.mutate({
          dietNo: currentDietNo,
          food: productData,
        });
  };
  const table = useMemo(() => {
    return makeTableData(productData, baseLineData);
  }, [baseLineData, productData]);

  return !productData || !baseLineData || isPageLoading ? (
    <Container
      style={{
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size={"large"} />
    </Container>
  ) : (
    <Container>
      {/* 영양성분 그래프 */}
      <InnerContainer>
        {!!dietDetailData && (
          <NutrientsProgress dietDetailData={dietDetailData} />
        )}
      </InnerContainer>

      {/* 식품상세정보 */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View>
          {/* 식품 썸네일 */}
          <FoodImageContainer
            source={{
              uri: `${process.env.EXPO_PUBLIC_BASE_URL}${productData.mainAttUrl}`,
            }}
            style={{ resizeMode: "contain" }}
          />
          <NutritionInImage>
            {/* 테이블 중 칼탄단지 */}
            {[table[0], table[2], table[4], table[5]].map((el) => {
              return (
                <View
                  key={el.name}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 0.25,
                  }}
                >
                  <Dot
                    style={{
                      backgroundColor: el.color,
                      marginHorizontal: 8,
                    }}
                  />
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {el.column2}
                  </Text>
                </View>
              );
            })}
          </NutritionInImage>
        </View>

        {/* 식품 정보 텍스트 */}
        <InnerContainer>
          <SellerText style={{ marginTop: 20 }}>
            [{productData.platformNm}]
          </SellerText>
          <ProductName>{productData.productNm}</ProductName>
          <Row style={{ marginTop: 8, justifyContent: "space-between" }}>
            <Col>
              <ShippingText numberOfLines={1} ellipsizeMode="tail">
                배송비: {commaToNum(productData.shippingPrice)} 원 (
                {commaToNum(productData.freeShippingPrice)}원 이상 무료)
              </ShippingText>
              <ShippingText numberOfLines={1} ellipsizeMode="tail">
                현재 장바구니 {productData.platformNm} 상품 :{" "}
                <ShippingText style={{ color: colors.textMain }}>
                  {commaToNum(
                    sumUpPriceOfSeller(
                      dietDetailAllData,
                      productData.platformNm
                    )
                  )}
                  원
                </ShippingText>
              </ShippingText>
            </Col>
          </Row>
          <Price>
            {commaToNum(
              parseInt(productData.price) + SERVICE_PRICE_PER_PRODUCT
            )}
            원
          </Price>

          {/* 영양성분 - 식품상세 - 배송정책 */}
          <Row
            style={{
              justifyContent: "flex-start",
            }}
          >
            {detailMenu.map((el, index) => {
              return (
                <React.Fragment key={`${el}-${index}`}>
                  <DetailMenu
                    onPress={() => setClicked(el)}
                    selected={el === clicked}
                  >
                    <DetailMenuText>{el}</DetailMenuText>
                  </DetailMenu>
                </React.Fragment>
              );
            })}
          </Row>

          {/* 영양성분 - 식품상세 - 배송정책에 따른 내용 */}
          <PartContainer>
            <ShowPart clicked={clicked} table={table} data={productData} />
          </PartContainer>
        </InnerContainer>

        {/* 사업자정보 */}
        <BusinessInfo bgColor={colors.backgroundLight} />
      </ScrollView>
      <View>
        {/* 하단 CTA버튼, like 버튼 */}
        <BtnBox>
          <LikeBtn onPress={handlePressLikeBtn}>
            <Icon
              size={52}
              style={{
                backgroundColor: colors.whiteOpacity70,
                borderRadius: 4,
              }}
              source={isIncludedInLike ? icons.likeActive_48 : icons.like_48}
            />
          </LikeBtn>
          <CtaButton
            btnStyle="active"
            style={{
              width: SCREENWIDTH - 32 - 16 - 52 - 6,
              backgroundColor: colors.main,
            }}
            onPress={handlePressAddCartBtn}
            btnText={
              params.from === "Change"
                ? "뒤로가기"
                : isAddedInCurrentDiet
                ? "현재끼니에서 제거"
                : "현재끼니에 추가"
            }
          />
        </BtnBox>
      </View>
    </Container>
  );
};

export default FoodDetail;

const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;

const InnerContainer = styled.View`
  padding: 0px 16px 0px 16px;
`;

const FoodImageContainer = styled.Image`
  width: ${SCREENWIDTH}px;
  height: ${SCREENWIDTH}px;
  background-color: ${colors.inactive};
`;
const SellerText = styled(TextSub)`
  margin-top: 10px;
  font-size: 14px;
`;
const ProductName = styled(TextMain)`
  margin-top: 4px;
  font-size: 20px;
  font-weight: bold;
`;
const ShippingText = styled(TextSub)`
  font-size: 14px;
`;
const Price = styled(TextMain)`
  font-size: 28px;
  font-weight: bold;
  margin-top: 16px;
`;
interface DetailMenuProps {
  onPress: () => void;
  selected?: boolean;
}

const DetailMenu = styled.TouchableOpacity<DetailMenuProps>`
  width: 74px;
  height: 32px;
  margin-top: 20px;
  margin-right: 4px;
  margin-bottom: 24px;
  border: 1px;
  border-radius: 5px;
  border-color: ${colors.inactive};
  background-color: ${({ selected }) => (selected ? colors.inactive : "white")};
  align-items: center;
  justify-content: center;
`;

const DetailMenuText = styled(TextMain)`
  font-size: 14px;
`;

const PartContainer = styled.View``;

const NutritionInImage = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 24px;
  background-color: ${colors.blackOpacity50};
`;

const BtnBox = styled(StickyFooter)`
  flex: 1;
  flex-direction: row;
  column-gap: 6px;
`;

const LikeBtn = styled.Pressable`
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
`;
