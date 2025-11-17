// RN, expo
import { ActivityIndicator } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useBulkEditDietDetails } from "@/shared/api/queries/diet";
import { IDietDetailData } from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";
import { AM_SELECTED_CATEGORY_IDX, AM_PRICE_TARGET } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import CtaButton from "@/shared/ui/CtaButton";
import { Col, Row, TextMain } from "@/shared/ui/styledComps";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";
import { getNutrStatus } from "@/shared/utils/sumUp";
import { setGlobalLoading } from "@/features/reduxSlices/commonSlice";
import { useRouter } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
  closeBSAll,
  resetBSData,
  setProductToDel,
} from "@/features/reduxSlices/bottomSheetSlice";
import Icon from "@/shared/ui/Icon";
import { getAutoMenuData } from "@/shared/utils/asyncStorage";
import { setAMSettingProgress } from "@/features/reduxSlices/autoMenuSlice";

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
  const [autoMenuState, setAutoMenuState] = useState({
    selectedCategoryIdx: AM_SELECTED_CATEGORY_IDX,
    priceSliderValue: AM_PRICE_TARGET,
    wantedCompany: "",
  });

  // useEffect
  useEffect(() => {
    (async () => {
      const data = await getAutoMenuData();
      setAutoMenuState({
        selectedCategoryIdx: data?.selectedCategory
          ? data.selectedCategory.reduce(
              (acc: number[], cur: boolean, idx: number) => {
                if (cur) acc.push(idx);
                return acc;
              },
              []
            )
          : [],
        priceSliderValue: data?.priceSliderValue ?? [],
        wantedCompany: data?.wantedCompany ?? "",
      });
    })();
  }, []);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const bulkEditDietDetailsMutation = useBulkEditDietDetails();

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
    // Flatten recommended products (menuNum could be >1 in future)
    const adds = data.flatMap((menu) =>
      menu.map((product) => ({ dietNo: carouselDietNo, product }))
    );
    if (adds.length === 0) return;
    await bulkEditDietDetailsMutation.mutateAsync({ adds });
  };

  const overwriteMenu = async (data: IProductData[][]) => {
    // Build deletes for current menu, then adds for replacement products
    const deletes = carouselMenu
      .filter((p) => !!p.productNo)
      .map((p) => ({ dietNo: p.dietNo, productNo: p.productNo as string }));
    const adds = data.flatMap((menu) =>
      menu.map((product) => ({ dietNo: carouselDietNo, product }))
    );
    try {
      await bulkEditDietDetailsMutation.mutateAsync({ adds, deletes });
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
          selectedCategoryIdx: autoMenuState.selectedCategoryIdx,
          priceTarget: autoMenuState.priceSliderValue,
          wantedPlatform: autoMenuState.wantedCompany,
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
    dispatch(closeBSAll({ from: "CarouselCta.tsx" }));
    dispatch(resetBSData());
    router.push({
      pathname: "/AutoAdd",
      params: { menu: JSON.stringify(carouselMenu), type: "add" },
    });
  };

  // etc
  const isCurrent = currentFMCIdx === carouselIdx;
  const autoMenuBtnStyle = isMenuFull ? "border" : "borderActive";
  // const autoMenuType = isMenuFull ? "overwrite" : "add";
  const addBtnStyle = "border";
  const addBtnText = isMenuFull ? "영양이 충분해요" : "식품 하나씩 추가";

  return (
    <>
      <BtnBox>
        {/* AutoMenu setting */}
        <CtaButton
          btnStyle="border"
          shadow={true}
          style={{ height: 48, width: 48 }}
          // btnText={addBtnText}
          btnContent={() => <Icon name="setting" color={colors.textSub} />}
          onPress={() => {
            dispatch(setAMSettingProgress(["AMCategory"]));
            router.push({
              pathname: "/AmSettings",
            });
          }}
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
          // btnContent={() => (
          //   <Icon
          //     name="calculator"
          //     color={isMenuFull ? colors.inactive : colors.main}
          //     style={{ marginLeft: -8 }}
          //   />
          // )}
          onPress={onCtaPress}
        />

        {/* AutoMenu btn */}
        <CtaButton
          btnStyle={autoMenuBtnStyle}
          shadow={true}
          style={{ flex: 1, height: 48 }}
          btnContent={() => (
            <Icon
              name="calculator"
              color={colors.main}
              style={{ marginLeft: -8 }}
            />
          )}
          btnText="자동 구성"
          btnTextStyle={{
            fontSize: 14,
            color: colors.textSub,
          }}
          onPress={() =>
            isMenuFull ? setShowCheckOverwrite(true) : setOneAutoMenu()
          }
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
