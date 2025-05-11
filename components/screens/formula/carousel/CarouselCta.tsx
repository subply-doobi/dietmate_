import { setAutoMenuStatus } from "@/features/reduxSlices/commonSlice";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useCreateDietDetail,
  useDeleteDietDetail,
} from "@/shared/api/queries/diet";
import { IDietDetailData } from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";
import {
  AM_ERROR_STATUS,
  AM_INITIAL_STATUS,
  AM_SELECTED_CATEGORY_IDX,
  AM_PRICE_TARGET,
  AM_MENU_NUM,
  AM_SUCCESS_STATUS,
} from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import CtaButton from "@/shared/ui/CtaButton";
import { Icon } from "@/shared/ui/styledComps";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";
import { getNutrStatus } from "@/shared/utils/sumUp";
import styled from "styled-components/native";

interface ICarouselCta {
  selectedFoods: string[];
  setSelectedFoods: React.Dispatch<React.SetStateAction<string[]>>;
  carouselMenu: IDietDetailData;
  carouselDietNo: string;
}
const CarouselCta = ({
  selectedFoods,
  setSelectedFoods,
  carouselMenu,
  carouselDietNo,
}: ICarouselCta) => {
  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const foodGroupForAutoMenu = useAppSelector(
    (state) => state.common.foodGroupForAutoMenu
  );
  const medianCalorie = useAppSelector((state) => state.common.medianCalorie);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const createDietDetailMutation = useCreateDietDetail();
  const deleteDietDetailMutation = useDeleteDietDetail();

  const nutrStatus = getNutrStatus({
    totalFoodList,
    bLData,
    dDData: carouselMenu,
  });

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
          initialMenu: autoMenuType === "add" ? carouselMenu : [],
          baseLine: bLData,
          selectedCategoryIdx: AM_SELECTED_CATEGORY_IDX,
          priceTarget: AM_PRICE_TARGET,
          wantedPlatform: "",
          menuNum: 1,
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
    } catch (e) {
      console.log("식품추가 중 오류 발생: ", e);
      dispatch(setAutoMenuStatus(AM_ERROR_STATUS));
      return;
    }
  };

  // etc
  const isMenuFull = nutrStatus === "satisfied" || nutrStatus === "exceed";
  const autoMenuBtnStyle = "border";
  const autoMenuType = isMenuFull ? "overwrite" : "add";
  const addBtnStyle = isMenuFull ? "border" : "borderActive";
  const addBtnText = "식품 추가";
  const addBtnIconSource = isMenuFull
    ? icons.plusSquare_24
    : icons.plusSquareActive_24;

  return (
    <BtnBox>
      {/* AutoMenu btn */}
      <CtaButton
        btnStyle={autoMenuBtnStyle}
        shadow={true}
        style={{ width: 48, height: 48 }}
        btnContent={() => <Icon source={icons.dice_36} size={36} />}
      />

      {/* Add btn */}
      <CtaButton
        btnStyle={addBtnStyle}
        shadow={true}
        style={{ flex: 1, height: 48 }}
        btnText={addBtnText}
        btnTextStyle={{ fontSize: 14 }}
        btnContent={() =>
          !isMenuFull && <Icon source={addBtnIconSource} size={18} />
        }
      />
    </BtnBox>
  );
};

export default CarouselCta;

const BtnBox = styled.View`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  flex-direction: row;
  justify-content: space-between;
  column-gap: 4px;
  align-items: center;
`;
