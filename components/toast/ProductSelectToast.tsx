// react, expo
import { useEffect, useState } from "react";

// 3rd
import styled from "styled-components/native";
import { useRouter } from "expo-router";

// doobi
import {
  useCreateDietDetail,
  useDeleteDietDetail,
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
import { setAutoAddFood } from "@/features/reduxSlices/formulaSlice";
import ProductSelectTShippingInfo from "./ProductSelectTShippingInfo";

const ProductSelectToast = (props: IToastCustomConfigParams) => {
  // redux
  const dispatch = useAppDispatch();
  const autoAddFoodForAdd = useAppSelector(
    (state) => state.formula.autoAddFoodForAdd
  );
  const autoAddFoodForChange = useAppSelector(
    (state) => state.formula.autoAddFoodForChange
  );
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  // useState
  const [isLoading, setIsLoading] = useState(true);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const createDietDetailMutation = useCreateDietDetail();
  const deleteDietDetailMutation = useDeleteDietDetail();

  // navigation
  const router = useRouter();

  // etc
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx];
  const currentMenu = dTOData?.[currentDietNo]?.dietDetail || [];
  const expectedMenu = autoAddFoodForAdd
    ? currentMenu
        .filter((m) => m.productNo !== autoAddFoodForChange?.productNo)
        .concat(autoAddFoodForAdd as IDietDetailProductData)
    : currentMenu;

  // useEffect
  useEffect(() => {
    if (!autoAddFoodForAdd) {
      setIsLoading(true);
      return;
    }
    // selectedFood 없을 때 추가된 경우 delay loading 후 progressBar 보여주기
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [autoAddFoodForAdd]);

  // fn
  const onPressInfo = () => {
    if (!autoAddFoodForAdd) {
      return;
    }
    props.hide();
    router.push({
      pathname: "/FoodDetail",
      params: { productNo: autoAddFoodForAdd.productNo, type: "infoOnly" },
    });
  };

  const onPressAdd = () => {
    if (!autoAddFoodForAdd) {
      return;
    }
    props.hide();
    setTimeout(() => {
      dispatch(
        setAutoAddFood({
          foodForAdd: undefined,
          foodForChange: undefined,
        })
      );
    }, 150);
    router.back();
    setTimeout(async () => {
      autoAddFoodForChange &&
        (await deleteDietDetailMutation.mutateAsync({
          dietNo: currentDietNo,
          productNo: autoAddFoodForChange.productNo,
        }));
      await createDietDetailMutation.mutateAsync({
        dietNo: currentDietNo,
        food: autoAddFoodForAdd,
      });
    }, 500);
  };

  const onPressBack = () => {
    dispatch(
      setAutoAddFood({
        foodForAdd: undefined,
        foodForChange: autoAddFoodForChange,
      })
    );
    props.hide();
  };

  if (!autoAddFoodForAdd) {
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
      <ProductSelectTShippingInfo />
      <ProductSelectFoodlist foods={currentMenu} />
      <CtaRow>
        <InfoBtn onPress={onPressInfo}>
          {autoAddFoodForChange && (
            <ProductNm
              style={{
                color: colors.textSub,
                textDecorationLine: "line-through",
                fontWeight: "200",
              }}
            >
              {autoAddFoodForChange?.productNm}
            </ProductNm>
          )}
          <Row style={{ columnGap: 4, width: "100%" }}>
            <ProductNm>{autoAddFoodForAdd.productNm}</ProductNm>
            <Icon source={icons.infoRoundWhite_24} size={16} />
          </Row>
          <NutrText>{`칼: ${parseInt(
            autoAddFoodForAdd.calorie
          )}kcal | 탄: ${parseInt(autoAddFoodForAdd.carb)}g | 단: ${parseInt(
            autoAddFoodForAdd.protein
          )}g | 지: ${parseInt(autoAddFoodForAdd.fat)}g`}</NutrText>
        </InfoBtn>
        <CTA onPress={onPressAdd}>
          <Icon
            source={
              autoAddFoodForChange
                ? icons.changeRoundWhite_24
                : icons.plusRoundWhite_24
            }
            size={24}
          />
        </CTA>
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
  row-gap: 4px;
  padding-left: 4px;
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

const CTA = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${colors.main};
  /* background-color: ${colors.main}; */
  justify-content: center;
  align-items: center;
`;
