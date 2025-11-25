import CollapsibleNutrientProgress from "./CollapsibleNutrientProgress";
import {
  useDeleteDiet,
  useListDietTotalObj,
  useBulkEditDietDetails,
} from "@/shared/api/queries/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import colors from "@/shared/colors";
import {
  MENU_LABEL,
  SCREENHEIGHT,
  AM_DEFAULT_SETTINGS,
} from "@/shared/constants";
import {
  Col,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { useState, useEffect, useMemo } from "react";
import MenuHeader from "./MenuHeader";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import styled from "styled-components/native";
import IconCtaBar from "./IconCtaBar";
import GroupedProductList from "./GroupedProductList";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import Icon from "@/shared/ui/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import {
  closeBSAll,
  resetBSData,
  setProductToDel,
} from "@/features/reduxSlices/bottomSheetSlice";
import { setGlobalLoading } from "@/features/reduxSlices/commonSlice";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { setAMSettingProgress } from "@/features/reduxSlices/autoMenuSlice";
import { getAutoMenuSettings } from "@/shared/utils/asyncStorage";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";
import { getNutrStatus } from "@/shared/utils/sumUp";
import { IProductData } from "@/shared/api/types/product";
import { bsConfigByName } from "@/components/bottomSheet/bsConfig";

interface ICarouselContent {
  carouselRef: React.RefObject<ICarouselInstance | null>;
  carouselIdx: number;
}

const CarouselContent = ({ carouselRef, carouselIdx }: ICarouselContent) => {
  // insets
  const insets = useSafeAreaInsets();
  const bottomTabHeight = useBottomTabBarHeight();
  const bsHeight = bsConfigByName["summaryInfo"]?.snapPoints?.[0] as number;
  const formulaCarouselHeight =
    SCREENHEIGHT - insets.top - bottomTabHeight - 16 - 32 - 16 - bsHeight - 16;

  // redux
  const dispatch = useAppDispatch();
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietMutation = useDeleteDiet();

  // navigation
  const router = useRouter();

  // useState
  const [isCheckDelete, setIsCheckDelete] = useState(false);
  const [showCheckOverwrite, setShowCheckOverwrite] = useState(false);
  const [autoMenuSettings, setAutoMenuSettings] =
    useState<typeof AM_DEFAULT_SETTINGS>(AM_DEFAULT_SETTINGS);

  // redux state
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const foodGroupForAutoMenu = useAppSelector(
    (state) => state.common.foodGroupForAutoMenu
  );
  const medianCalorie = useAppSelector((state) => state.common.medianCalorie);
  const globalLoading = useAppSelector((state) => state.common.globalLoading);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const bulkEditDietDetailsMutation = useBulkEditDietDetails();

  // useEffect - load auto menu settings
  useEffect(() => {
    (async () => {
      const data = await getAutoMenuSettings();
      setAutoMenuSettings(data);
    })();
  }, []);

  // etc
  const carouselDietNo = Object.keys(dTOData || {})[carouselIdx];
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx] || "";
  const carouselMenu = dTOData?.[carouselDietNo]?.dietDetail || [];
  const isCurrent = currentFMCIdx === carouselIdx;
  const currentQty = dTOData?.[carouselDietNo]?.dietDetail?.[0]?.qty || 1;

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

  // handlers
  const menuDelete = () => {
    const lastMenuIdx = Object.keys(dTOData || {}).length - 1;
    if (lastMenuIdx === 0) {
      deleteDietMutation.mutate({ dietNo: carouselDietNo, currentDietNo });
      return;
    }

    if (lastMenuIdx === carouselIdx) {
      carouselRef.current?.scrollTo({
        index: lastMenuIdx - 1,
        animated: true,
      });
    }
    setTimeout(() => {
      deleteDietMutation.mutate({ dietNo: carouselDietNo, currentDietNo });
    }, 700);
  };

  const addMenu = async (data: IProductData[][]) => {
    const adds = data.flatMap((menu) =>
      menu.map((product) => ({ dietNo: carouselDietNo, product }))
    );
    if (adds.length === 0) return;
    await bulkEditDietDetailsMutation.mutateAsync({ adds });
  };

  const overwriteMenu = async (data: IProductData[][]) => {
    const deletes = carouselMenu
      .filter((p) => !!p.productNo)
      .map((p) => ({ dietNo: p.dietNo, productNo: p.productNo as string }));
    const adds = data.flatMap((menu) =>
      menu.map((product) => ({ dietNo: carouselDietNo, product }))
    );
    // Don't swallow errors - let them bubble up
    await bulkEditDietDetailsMutation.mutateAsync({ deletes });
    await bulkEditDietDetailsMutation.mutateAsync({ adds });
  };

  const setOneAutoMenu = async () => {
    if (!bLData || totalFoodList?.length === 0) {
      return;
    }

    dispatch(setProductToDel([]));
    dispatch(setGlobalLoading(true));

    let recommendedMenu: IProductData[][] = [];
    let success = false;

    try {
      const result = await makeAutoMenu3({
        medianCalorie,
        foodGroupForAutoMenu,
        initialMenu: isMenuFull ? [] : carouselMenu,
        baseLine: bLData,
        selectedCategory: autoMenuSettings.selectedCategory,
        priceTarget: autoMenuSettings.priceSliderValue,
        wantedPlatform: autoMenuSettings.wantedCompany,
        menuNum: 1,
      });

      if (!result || !result.recommendedMenu) {
        throw new Error("makeAutoMenu3 returned invalid result");
      }

      recommendedMenu = result.recommendedMenu;

      if (recommendedMenu.length === 0 || !Array.isArray(recommendedMenu[0])) {
        throw new Error("Invalid recommendedMenu structure");
      }

      if (isMenuFull) {
        await overwriteMenu(recommendedMenu);
      } else {
        await addMenu(recommendedMenu);
      }

      success = true;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.log("자동구성/식품추가 중 오류 발생: ", errorMsg);
      console.error("Error details:", e);

      dispatch(
        openModal({
          name: "requestErrorAlert",
          values: { msg: errorMsg },
        })
      );
    } finally {
      // Always reset loading state, with slight delay for UX
      setTimeout(
        () => {
          dispatch(setGlobalLoading(false));
        },
        success ? 500 : 100
      );
    }
  };

  const onSettingsPress = () => {
    dispatch(setAMSettingProgress(["AMCategory"]));
    router.push({ pathname: "/AmSettings" });
  };

  const onAddProductPress = () => {
    dispatch(closeBSAll({ from: "CarouselContent" }));
    dispatch(resetBSData());
    router.push({
      pathname: "/AutoAdd",
      params: { menu: JSON.stringify(carouselMenu), type: "add" },
    });
  };

  const onAutoMenuPress = () => {
    isMenuFull ? setShowCheckOverwrite(true) : setOneAutoMenu();
  };

  const onConfirmOverwrite = () => {
    setShowCheckOverwrite(false);
    setOneAutoMenu();
  };

  const onCancelOverwrite = () => {
    setShowCheckOverwrite(false);
  };

  return (
    <MenuCard>
      <Box style={{ height: formulaCarouselHeight }}>
        {/* 근 삭제 알럿 대체 */}
        {isCheckDelete && (
          <DeleteCheckBox>
            <Col
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DeleteText style={{ fontSize: 16 }}>
                현재 근을 삭제할까요?
              </DeleteText>
            </Col>
            <Row style={{ width: "100%" }}>
              <DeleteConfirmBtn onPress={() => setIsCheckDelete(false)}>
                <DeleteText>취소</DeleteText>
              </DeleteConfirmBtn>
              <DeleteConfirmBtn
                onPress={() => {
                  menuDelete();
                  setIsCheckDelete(false);
                }}
              >
                <DeleteText>삭제</DeleteText>
              </DeleteConfirmBtn>
            </Row>
          </DeleteCheckBox>
        )}

        {/* 상단 타이틀 + 총 가격 */}
        <MenuHeader
          label={MENU_LABEL[carouselIdx]}
          products={carouselMenu}
          qty={currentQty}
        />
        <HorizontalSpace height={8} />

        {/* 삭제 버튼 */}
        {currentFMCIdx === carouselIdx && !isCheckDelete && (
          <MenuDeleteBtn onPress={() => isCurrent && setIsCheckDelete(true)}>
            <Icon name="cancelCircle" color={colors.textSub} iconSize={16} />
          </MenuDeleteBtn>
        )}

        {/* 상단 progressBar (collapsible) */}
        <CollapsibleNutrientProgress dietDetailData={carouselMenu} />
        <HorizontalSpace height={4} />
        {/* 메뉴 리스트 - grouped by seller */}
        <GroupedProductList dietDetailData={carouselMenu} />

        {/* CTA - icon buttons */}
        <IconCtaBar
          onSettings={onSettingsPress}
          onAddProduct={onAddProductPress}
          onAutoMenu={onAutoMenuPress}
          disabledAdd={isMenuFull}
          showOverwriteConfirm={showCheckOverwrite}
          onConfirmOverwrite={onConfirmOverwrite}
          onCancelOverwrite={onCancelOverwrite}
          globalLoading={globalLoading}
          isCurrent={isCurrent}
        />
      </Box>
    </MenuCard>
  );
};

export default CarouselContent;

const MenuCard = styled.View`
  margin: 0 40px;
  padding: 16px 0 0 0;
  z-index: 0;
`;

const Box = styled.View`
  width: 100%;
  border-radius: 12px;
  padding: 24px 0 8px 0;
  background-color: ${colors.white};
`;

// Title/SubTitle moved into MenuHeader component

const MenuDeleteBtn = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 100;
  justify-content: center;
  align-items: center;
`;

const DeleteCheckBox = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  border-radius: 12px;
  background-color: ${colors.blackOpacity80};
  align-items: center;
  justify-content: space-between;
`;

const DeleteConfirmBtn = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-width: 1px;
  border-color: ${colors.line};
  justify-content: center;
  align-items: center;
`;

const DeleteText = styled(TextMain)`
  color: ${colors.white};
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
`;
