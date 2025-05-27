// react, expo
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

// 3rd
import styled from "styled-components/native";
import { useRouter } from "expo-router";

// doobi

import { setAutoAddSelectedFood } from "@/features/reduxSlices/formulaSlice";
import {
  useCreateDietDetail,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import ProductSelectFoodlist from "./ProductSelectTFoodlist";
import NutrientsProgress from "../common/nutrient/NutrientsProgress";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import { IToastCustomConfigParams } from "@/shared/store/toastStore";

const ProductSelectToast = (props: IToastCustomConfigParams) => {
  // redux
  const dispatch = useAppDispatch();
  const selectedFood = useAppSelector(
    (state) => state.formula.autoAddSelectedFood
  );
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  // useState
  const [isLoading, setIsLoading] = useState(true);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const createDietDetailMutation = useCreateDietDetail();

  // navigation
  const router = useRouter();

  // etc
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx];
  const currentMenu = dTOData?.[currentDietNo]?.dietDetail || [];
  const expectedMenu = selectedFood
    ? currentMenu.concat(selectedFood as IDietDetailProductData)
    : currentMenu;

  // useEffect
  useEffect(() => {
    if (!selectedFood) {
      setIsLoading(true);
      return;
    }
    // selectedFood 없을 때 추가된 경우 delay loading 후 progressBar 보여주기
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [selectedFood]);

  // fn
  const onPressInfo = () => {
    if (!selectedFood) {
      return;
    }
    props.hide();
    router.push({
      pathname: "/FoodDetail",
      params: { productNo: selectedFood.productNo },
    });
  };

  const onPressAdd = () => {
    if (!selectedFood) {
      return;
    }
    props.hide();
    setTimeout(() => {
      dispatch(setAutoAddSelectedFood(undefined));
    }, 150);
    router.back();
    setTimeout(() => {
      createDietDetailMutation.mutate({
        dietNo: currentDietNo,
        food: selectedFood,
      });
    }, 500);
  };

  const onPressBack = () => {
    dispatch(setAutoAddSelectedFood(undefined));
    props.hide();
  };

  if (!selectedFood) {
    return null;
  }

  return (
    <ToastBox>
      <BackBtn onPress={onPressBack}>
        <Icon source={icons.deleteRoundWhite_24} size={20} />
      </BackBtn>
      <NutrientsProgress
        dietDetailData={expectedMenu}
        textColor={colors.whiteOpacity70}
        isLoading={isLoading}
      />
      <ProductSelectFoodlist foods={currentMenu} />
      <CtaRow>
        <InfoBtn onPress={onPressInfo}>
          <Row style={{ columnGap: 4, width: "100%" }}>
            <ProductNm>{selectedFood.productNm}</ProductNm>
            <Icon source={icons.infoRoundWhite_24} size={16} />
          </Row>
          <NutrText>{`칼: ${parseInt(
            selectedFood.calorie
          )}kcal | 탄: ${parseInt(selectedFood.carb)}g | 단: ${parseInt(
            selectedFood.protein
          )}g | 지: ${parseInt(selectedFood.fat)}g`}</NutrText>
        </InfoBtn>
        <PlusBtn onPress={onPressAdd}>
          <Icon source={icons.plusRoundSmall_24} size={28} />
        </PlusBtn>
      </CtaRow>
    </ToastBox>
  );
};

export default ProductSelectToast;

const ToastBox = styled.View`
  width: 95%;
  background-color: ${colors.blackOpacity80};
  padding: 24px 16px;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
`;

const BackBtn = styled.TouchableOpacity`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
`;

const CtaRow = styled.View`
  width: 100%;
  height: 72px;
  column-gap: 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const InfoBtn = styled.TouchableOpacity`
  flex: 1;
  height: 72px;
  padding: 0 4px;
  row-gap: 4px;
  justify-content: center;
`;

const ProductNm = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  font-weight: 600;
  color: ${colors.white};
`;

const NutrText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  color: ${colors.inactive};
`;

const PlusBtn = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${colors.whiteOpacity30};
  /* background-color: ${colors.main}; */
  justify-content: center;
  align-items: center;
`;
