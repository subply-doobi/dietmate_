// RN, expo
import { ActivityIndicator } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useCreateDietDetail,
  useDeleteDietDetail,
} from "@/shared/api/queries/diet";
import { IDietDetailData } from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";
import { AM_SELECTED_CATEGORY_IDX, AM_PRICE_TARGET } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import CtaButton from "@/shared/ui/CtaButton";
import { Col, Icon, Row, TextMain } from "@/shared/ui/styledComps";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";
import { getNutrStatus } from "@/shared/utils/sumUp";
import { setGlobalLoading } from "@/features/reduxSlices/commonSlice";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { setProductToDel } from "@/features/reduxSlices/bottomSheetSlice";

interface ICarouselCta {
  carouselMenu: IDietDetailData;
  carouselDietNo: string;
  carouselIdx: number;
}
const CarouselCta = ({
  carouselMenu,
  carouselDietNo,
  carouselIdx,
}: ICarouselCta) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const foodGroupForAutoMenu = useAppSelector(
    (state) => state.common.foodGroupForAutoMenu
  );
  const medianCalorie = useAppSelector((state) => state.common.medianCalorie);
  const globalLoading = useAppSelector((state) => state.common.globalLoading);
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  // useState
  const [showCheckOverwrite, setShowCheckOverwrite] = useState(false);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const createDietDetailMutation = useCreateDietDetail();
  const deleteDietDetailMutation = useDeleteDietDetail();

  // useMemo
  const isMenuFull = useMemo(() => {
    const nutrStatus = getNutrStatus({
      totalFoodList,
      bLData,
      dDData: carouselMenu,
    });
    const isMenuFull = nutrStatus === "satisfied" || nutrStatus === "exceed";
    return isMenuFull;
  }, [carouselMenu, totalFoodList, bLData]);

  // fn
  const addMenu = async (data: IProductData[][]) => {
    // 추가할 각 product 및 dietNo
    const productToAddList: { dietNo: string; food: IProductData }[] = [];
    data?.forEach((menu, idx) => {
      menu.forEach((product) => {
        productToAddList.push({
          dietNo: carouselDietNo,
          food: product,
        });
      });
    });
    const createMutations = async () => {
      for (const p of productToAddList) {
        await createDietDetailMutation.mutateAsync({
          food: p.food,
          dietNo: p.dietNo,
        });
      }
    };

    // 한꺼번에 추가할 mutation list
    await createMutations();
  };

  const overwriteMenu = async (data: IProductData[][]) => {
    // selectedMenu 에 대한 각 productNo
    let productToDeleteList: { dietNo: string; productNo: string }[] = [];
    carouselMenu.forEach(
      (p) =>
        p.productNo &&
        productToDeleteList.push({
          dietNo: p.dietNo,
          productNo: p.productNo,
        })
    );

    try {
      // 자동구성할 끼니 (선택된 끼니) 초기화 및 자동구성된 식품 각 끼니에 추가
      await Promise.all(
        productToDeleteList.map((p) =>
          deleteDietDetailMutation.mutateAsync({
            dietNo: p.dietNo,
            productNo: p.productNo,
          })
        )
      );
      await addMenu(data);
    } catch (e) {
      console.log("끼니 덮어쓰기 중 오류: ", e);
    }
  };

  const setOneAutoMenu = async () => {
    if (!bLData || totalFoodList?.length === 0) {
      return;
    }
    dispatch(setProductToDel([]));
    dispatch(setGlobalLoading(true));
    let recommendedMenu: IProductData[][] = [];

    // 자동구성
    try {
      setTimeout(() => {
        dispatch(setGlobalLoading(false));
      }, 1500);
      const { recommendedMenu: tempRM, resultSummaryObj } = await makeAutoMenu3(
        {
          medianCalorie,
          foodGroupForAutoMenu,
          initialMenu: isMenuFull ? [] : carouselMenu,
          baseLine: bLData,
          selectedCategoryIdx: AM_SELECTED_CATEGORY_IDX,
          priceTarget: AM_PRICE_TARGET,
          wantedPlatform: "",
          menuNum: 1,
        }
      );
      recommendedMenu = tempRM;
    } catch (e) {
      console.log("자동구성 중 오류 발생: ", e);
      return;
    }
    // 자동구성된 메뉴 추가
    try {
      isMenuFull
        ? await overwriteMenu(recommendedMenu)
        : await addMenu(recommendedMenu);
      // overwriteMenu(recommendedMenu);
    } catch (e) {
      console.log("식품추가 중 오류 발생: ", e);
      return;
    }
  };

  const onCtaPress = () => {
    router.push({
      pathname: "/AutoAdd",
      params: { menu: JSON.stringify(carouselMenu), type: "add" },
    });
  };

  // etc
  const isCurrent = currentFMCIdx === carouselIdx;
  const autoMenuBtnStyle = "border";
  // const autoMenuType = isMenuFull ? "overwrite" : "add";
  const addBtnStyle = isMenuFull ? "border" : "borderActive";
  const addBtnText = isMenuFull ? "영양이 충분해요" : "영양소에 맞게 추가";
  const addBtnIconSource = isMenuFull
    ? icons.formula_36
    : icons.formulaActive_36;

  return (
    <>
      <BtnBox>
        {/* AutoMenu btn */}
        <CtaButton
          btnStyle={autoMenuBtnStyle}
          shadow={true}
          style={{ width: 48, height: 48 }}
          btnContent={() => <Icon source={icons.dice_36} size={32} />}
          onPress={() =>
            isMenuFull ? setShowCheckOverwrite(true) : setOneAutoMenu()
          }
        />

        {/* Add btn */}
        <CtaButton
          btnStyle={addBtnStyle}
          shadow={true}
          disabled={isMenuFull}
          style={{ flex: 1, height: 48 }}
          btnText={addBtnText}
          btnTextStyle={{
            fontSize: 14,
            color: isMenuFull ? colors.inactive : colors.textSub,
          }}
          btnContent={() => (
            <Icon
              source={addBtnIconSource}
              size={28}
              style={{ marginLeft: -16 }}
            />
          )}
          onPress={onCtaPress}
        />
      </BtnBox>
      {globalLoading && isCurrent && (
        <OpacityView>
          <Col style={{ rowGap: 4 }}>
            <LoadingText>잠시만 기다려주세요</LoadingText>
            <LoadingSubText>자동으로 영양성분 채우는 중...</LoadingSubText>
          </Col>
          <ActivityIndicator
            size={"small"}
            color={colors.white}
            style={{ marginTop: 24 }}
          />
        </OpacityView>
      )}
      {showCheckOverwrite && (
        <OpacityView>
          <Col style={{ rowGap: 4 }}>
            <LoadingText>현재 근에 식품이 충분해요</LoadingText>
            <LoadingText>기존 식품들을 덮어쓸까요?</LoadingText>
          </Col>
          <Row style={{ position: "absolute", bottom: 0, width: "100%" }}>
            <CheckOverwriteBtn onPress={() => setShowCheckOverwrite(false)}>
              <SelectedText>취소</SelectedText>
            </CheckOverwriteBtn>
            <CheckOverwriteBtn
              onPress={() => {
                setShowCheckOverwrite(false);
                setOneAutoMenu();
              }}
            >
              <SelectedText>확인</SelectedText>
            </CheckOverwriteBtn>
          </Row>
        </OpacityView>
      )}
    </>
  );
};

/* <LoadingAlertContent /> */

export default CarouselCta;

const BtnBox = styled.View`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  flex-direction: row;
  justify-content: space-between;
  column-gap: 8px;
  align-items: center;
`;

const OpacityView = styled.View`
  background-color: ${colors.blackOpacity70};
  position: absolute;
  border-radius: 0 0 5px 5px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
  color: ${colors.white};
  text-align: center;
`;

const LoadingSubText = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.inactive};
  text-align: center;
`;

const CheckOverwriteBtn = styled.TouchableOpacity`
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
