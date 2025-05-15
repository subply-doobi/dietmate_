// RN, expo
import { ViewProps } from "react-native";
import { useRouter } from "expo-router";

// 3rd
import styled from "styled-components/native";

// doobi
import { IProductData } from "@/shared/api/types/product";
import { IDietDetailData } from "@/shared/api/types/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useCreateDietDetail,
  useDeleteDietDetail,
} from "@/shared/api/queries/diet";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { getNutrStatus } from "@/shared/utils/sumUp";
import {
  setAutoMenuStatus,
  setTutorialProgress,
} from "@/features/reduxSlices/commonSlice";
import { closeModal } from "@/features/reduxSlices/modalSlice";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";

import { Col, Row } from "@/shared/ui/styledComps";
import CtaButton from "@/shared/ui/CtaButton";
import {
  AM_ERROR_STATUS,
  AM_INITIAL_STATUS,
  AM_SELECTED_CATEGORY_IDX,
  AM_PRICE_TARGET,
  AM_MENU_NUM,
  AM_SUCCESS_STATUS,
} from "@/shared/constants";

interface IAccordionCtaBtns extends ViewProps {
  dDData: IDietDetailData;
  dietNo: string;
  onlyAuto?: boolean;
  onlyAdd?: boolean;
}
const AccordionCtaBtns = ({
  dDData,
  dietNo,
  onlyAdd,
  onlyAuto,
  ...props
}: IAccordionCtaBtns) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const {
    totalFoodList,
    isTutorialMode,
    tutorialProgress,
    foodGroupForAutoMenu,
    medianCalorie,
  } = useAppSelector((state) => state.common);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const createDietDetailMutation = useCreateDietDetail();
  const deleteDietDetailMutation = useDeleteDietDetail();

  // etc
  const nutrStatus = getNutrStatus({ totalFoodList, bLData, dDData });
  const btnText =
    nutrStatus === "satisfied" || nutrStatus === "exceed"
      ? "자동구성 재시도"
      : nutrStatus === "notEnough"
      ? "남은 영양만큼 자동구성"
      : "자동구성";

  const autoMenuType = btnText === "자동구성 재시도" ? "overwrite" : "add";
  const autoBtnStyle =
    nutrStatus === "empty"
      ? "border"
      : nutrStatus === "notEnough"
      ? "borderActive"
      : "border";
  const addBtnStyle = nutrStatus === "empty" ? "borderActive" : "border";

  // fn
  const addMenu = async (data: IProductData[][]) => {
    // 추가할 각 product 및 dietNo
    const productToAddList: { dietNo: string; food: IProductData }[] = [];
    data?.forEach((menu, idx) => {
      menu.forEach((product) => {
        productToAddList.push({
          dietNo,
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
    dDData.forEach(
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
    dispatch(closeModal({ name: "tutorialTPSAutoRemain" }));
    if (!bLData || totalFoodList?.length === 0) {
      dispatch(setAutoMenuStatus(AM_ERROR_STATUS));
      return;
    }

    dispatch(setAutoMenuStatus(AM_INITIAL_STATUS));
    let recommendedMenu: IProductData[][] = [];

    // 자동구성
    try {
      const { recommendedMenu: tempRM, resultSummaryObj } = await makeAutoMenu3(
        {
          medianCalorie,
          foodGroupForAutoMenu,
          initialMenu: autoMenuType === "add" && dDData ? dDData : [],
          baseLine: bLData,
          selectedCategoryIdx: AM_SELECTED_CATEGORY_IDX,
          priceTarget: AM_PRICE_TARGET,
          wantedPlatform: "",
          menuNum: AM_MENU_NUM,
        }
      );
      recommendedMenu = tempRM;
    } catch (e) {
      dispatch(setAutoMenuStatus(AM_ERROR_STATUS));
      console.log("자동구성 중 오류 발생: ", e);
      return;
    }
    // 자동구성된 메뉴 추가
    try {
      autoMenuType === "add"
        ? await addMenu(recommendedMenu)
        : await overwriteMenu(recommendedMenu);
      dispatch(setAutoMenuStatus(AM_SUCCESS_STATUS));
      isTutorialMode && dispatch(setTutorialProgress("ChangeFood"));
    } catch (e) {
      console.log("식품추가 중 오류 발생: ", e);
      dispatch(setAutoMenuStatus(AM_ERROR_STATUS));
      return;
    }
  };

  return (
    <Col {...props}>
      <Row style={{ justifyContent: "space-between", columnGap: 8 }}>
        {!onlyAuto ? (
          <CtaButton
            shadow={false}
            btnStyle={addBtnStyle}
            // btnContent={() => <Icon source={icons.plus_24} />}
            btnText="+"
            style={{ width: 48, height: 48, borderWidth: 1 }}
            onPress={() => {
              dispatch(closeModal({ name: "tutorialTPSAddFood" }));
              isTutorialMode && dispatch(setTutorialProgress("SelectFood"));
              router.push({ pathname: "/ManualAdd" });
            }}
          />
        ) : (
          <Dummy />
        )}
        {!onlyAdd && (
          <CtaButton
            shadow={false}
            btnStyle={autoBtnStyle}
            btnTextStyle={{ fontSize: 14 }}
            btnText={btnText}
            style={{
              flex: 1,
              height: 48,
              borderWidth: 1,
            }}
            onPress={() => setOneAutoMenu()}
          />
        )}
      </Row>
    </Col>
  );
};

export default AccordionCtaBtns;

const Dummy = styled.View`
  width: 48px;
  height: 48px;
`;
