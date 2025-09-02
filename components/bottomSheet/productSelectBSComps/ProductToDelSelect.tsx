import {
  closeBS,
  setProductToDel,
} from "@/features/reduxSlices/bottomSheetSlice";
import {
  useDeleteDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { ENV } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import Icon from "@/shared/ui/Icon";
import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image } from "react-native";
import styled from "styled-components/native";

const ProductToDelSelect = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const pToDel = useAppSelector((state) => state.bottomSheet.product.del);
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietDetailMutation = useDeleteDietDetail();

  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx];
  const dDData = dTOData?.[currentDietNo]?.dietDetail || [];

  // useState
  const [isDoubleCheckDelete, setIsDoubleCheckDelete] = useState(false);

  // fn
  const onInfoBtnPress = (productNo: string) => {
    dispatch(closeBS());
    setTimeout(() => {
      router.push({
        pathname: "/FoodDetail",
        params: { productNo, type: "infoOnly" },
      });
    }, 200);
  };

  const onChangeBtnPress = () => {
    if (!pToDel || pToDel.length === 0) return;
    dispatch(closeBS());
    router.push({
      pathname: "/AutoAdd",
      params: {
        menu: JSON.stringify(
          dDData.filter((p) => p.productNo !== pToDel[0].productNo)
        ),
      },
    });
  };

  const onDeleteConfirm = async () => {
    const deleteFoods = async () => {
      const deleteMutations = pToDel.map((p) => {
        deleteDietDetailMutation.mutateAsync({
          dietNo: currentDietNo,
          productNo: p.productNo,
        });
      });
      await Promise.all(deleteMutations).catch((e) =>
        console.log("삭제 실패", e)
      );
    };
    await deleteFoods();
    dispatch(setProductToDel([]));
    dispatch(closeBS());
  };

  return (
    <Container>
      <Box>
        {pToDel.map((p, idx) => (
          <InfoBtn key={idx} onPress={() => onInfoBtnPress(p.productNo)}>
            <Row
              style={{
                flex: 1,
                columnGap: 8,
              }}
            >
              <Image
                source={{ uri: `${ENV.BASE_URL}${p.mainAttUrl}` }}
                style={{ borderRadius: 4, width: 40, height: 40 }}
              />
              <Row style={{ flex: 1, alignItems: "flex-start" }}>
                <Col style={{ flex: 1 }}>
                  <Name>{p.productNm}</Name>
                  <Nutr>
                    {parseInt(p.calorie)}kcal | {parseInt(p.carb)}g |{" "}
                    {parseInt(p.protein)}g | {parseInt(p.fat)}g
                  </Nutr>
                </Col>
                <Icon name="infoCircle" color={colors.white} />
              </Row>
            </Row>
          </InfoBtn>
        ))}
      </Box>

      {/* 식품 변경, 삭제 버튼 */}
      <BtnRow>
        {pToDel.length === 1 && (
          <Btn onPress={onChangeBtnPress}>
            <BtnText>식품 변경</BtnText>
          </Btn>
        )}
        <Btn onPress={() => setIsDoubleCheckDelete(true)}>
          <BtnText>식품 삭제</BtnText>
        </Btn>
      </BtnRow>

      {/* 삭제 이중확인 버튼 */}
      {isDoubleCheckDelete && (
        <OpacityView>
          <Col
            style={{
              paddingBottom: 72,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BtnText
              style={{ textAlign: "center" }}
            >{`선택한 식품을 \n현재 근에서 삭제합니다`}</BtnText>
          </Col>
          <BtnRow style={{ paddingHorizontal: 16 }}>
            <Btn onPress={() => setIsDoubleCheckDelete(false)}>
              <BtnText>취소</BtnText>
            </Btn>
            <Btn onPress={onDeleteConfirm}>
              <BtnText>삭제</BtnText>
            </Btn>
          </BtnRow>
        </OpacityView>
      )}
    </Container>
  );
};

export default ProductToDelSelect;

const Container = styled.View`
  padding: 24px 16px 104px 16px;
  width: 100%;
`;

const InfoBtn = styled.TouchableOpacity`
  flex: 1;
`;

const Box = styled.View`
  row-gap: 24px;
`;

const BtnRow = styled(Row)`
  position: absolute;
  bottom: 24px;
  align-self: center;
  column-gap: 8px;
  width: 100%;
`;

const Btn = styled.TouchableOpacity`
  flex-direction: row;
  flex: 1;
  height: 48px;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${colors.line};
`;

const BtnText = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  color: ${colors.white};
`;

const Name = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: ${colors.white};
`;

const Nutr = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
`;

const OpacityView = styled.View`
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${colors.blackOpacity80};
  justify-content: center;
  align-items: center;
`;
