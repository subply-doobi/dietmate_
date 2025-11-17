// RN, expo
import React, { useEffect, useMemo, useState } from "react";
import { getAutoMenuData } from "@/shared/utils/asyncStorage";
import { ActivityIndicator } from "react-native";

// 3rd

// doobi
import { Col } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import {
  useBulkEditDietDetails,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";

import { IProductData } from "@/shared/api/types/product";
import { getNutrStatus } from "@/shared/utils/sumUp";
import {
  setMenuAcActive,
  setTutorialProgress,
} from "@/features/reduxSlices/commonSlice";
import { makeAutoMenu3 } from "@/shared/utils/autoMenu3";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useAsync } from "@/shared/utils/screens/diet/cartCustomHooks";
import { usePathname, useRouter } from "expo-router";
import Error from "./Error";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";

const Processing = () => {
  // navigaton
  const router = useRouter();
  const pathname = usePathname();

  // redux
  const dispatch = useAppDispatch();
  const { totalFoodList, foodGroupForAutoMenu, medianCalorie, isTutorialMode } =
    useAppSelector((state) => state.common);

  // Local state for asyncStorage values (grouped)
  const [autoMenuState, setAutoMenuState] = useState({
    selectedCategoryIdx: [] as number[],
    priceSliderValue: [] as number[],
    wantedCompany: "",
  });
  const selectedDietNo = useAppSelector(
    (state) => state.autoMenu.selectedDietNo
  );

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const data = await getAutoMenuData();
      console.log("Processing: getAutoMenuData: ", data);
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
  const { data: dTOData } = useListDietTotalObj();
  const bulkEditDietDetailsMutation = useBulkEditDietDetails();

  // selectedCategoryIdx is now from state above

  // etc
  const isFormulaPage = pathname.includes("/Formula");
  const nutrStatus = getNutrStatus({
    totalFoodList,
    bLData,
    dDData: [],
  });
  const autoMenuType = nutrStatus === "notEnough" ? "add" : "overwrite";

  // useAsync for makeAutoMenu3, but only execute when all dependencies are loaded
  const {
    data: autoMenuResult,
    isLoading,
    isError,
    isSuccess,
    execute,
  } = useAsync<{
    recommendedMenu: IProductData[][];
    resultSummaryObj: {
      perfect: number;
      better: number;
      good: number;
      etc: number;
      isBudgetExceeded: boolean;
    };
  }>({
    asyncFunction: async () => {
      if (
        !bLData ||
        !dTOData ||
        autoMenuState.selectedCategoryIdx.length === 0
      ) {
        return {
          recommendedMenu: [],
          resultSummaryObj: {
            perfect: 0,
            better: 0,
            good: 0,
            etc: 0,
            isBudgetExceeded: false,
          },
        };
      }
      return await makeAutoMenu3({
        medianCalorie,
        foodGroupForAutoMenu,
        initialMenu: [],
        baseLine: bLData,
        selectedCategoryIdx: autoMenuState.selectedCategoryIdx,
        priceTarget: autoMenuState.priceSliderValue,
        wantedPlatform: autoMenuState.wantedCompany,
        menuNum: selectedDietNo.length,
      });
    },
    autoRun: false,
    deps: [
      bLData,
      dTOData,
      autoMenuState,
      medianCalorie,
      foodGroupForAutoMenu,
      selectedDietNo.length,
    ],
  });

  // Only execute when all dependencies are loaded
  useEffect(() => {
    if (bLData && dTOData && autoMenuState.selectedCategoryIdx.length > 0) {
      execute();
    }
  }, [
    bLData,
    dTOData,
    autoMenuState,
    medianCalorie,
    foodGroupForAutoMenu,
    selectedDietNo.length,
  ]);

  // overwriteDiet (한끼니 자동구성 재시도, 전체 자동구성)
  useEffect(() => {
    if (
      !isSuccess ||
      !bLData ||
      !dTOData ||
      autoMenuResult?.recommendedMenu.length === 0 ||
      autoMenuType === "add"
    )
      return;

    const overwriteDiet = async () => {
      // Build deletes for all selected menus
      const deletes = selectedDietNo.flatMap((dietNo) =>
        dTOData[dietNo].dietDetail.map((p) => ({
          dietNo: p.dietNo,
          productNo: p.productNo,
        }))
      );
      // Build adds for recommended products
      const adds =
        autoMenuResult?.recommendedMenu.flatMap((menu, idx) =>
          menu.map((product) => ({
            dietNo: selectedDietNo[idx],
            product,
          }))
        ) ?? [];
      try {
        await bulkEditDietDetailsMutation.mutateAsync({ adds, deletes });
      } catch (e) {
        console.log("선택된 끼니 덮어쓰기 중 오류: ", e);
      }
      dispatch(setMenuAcActive([]));
      dispatch(setTutorialProgress("Complete"));
      isFormulaPage ? dispatch(setFormulaProgress(["Formula"])) : router.back();
      if (!autoMenuResult?.resultSummaryObj) return;
      const { isBudgetExceeded } = autoMenuResult.resultSummaryObj;
      !isTutorialMode &&
        isBudgetExceeded &&
        dispatch(openModal({ name: "autoMenuOverPriceAlert" }));
    };
    overwriteDiet();
  }, [isSuccess]);

  // addMenu (남은영양 자동구성)
  useEffect(() => {
    if (
      !isSuccess ||
      !bLData ||
      !dTOData ||
      autoMenuResult?.recommendedMenu.length === 0 ||
      autoMenuType === "overwrite"
    )
      return;

    const addMenu = async () => {
      // Build adds for recommended products
      const adds =
        autoMenuResult?.recommendedMenu.flatMap((menu, idx) =>
          menu.map((product) => ({
            dietNo: selectedDietNo[idx],
            product,
          }))
        ) ?? [];
      try {
        await bulkEditDietDetailsMutation.mutateAsync({ adds });
      } catch (e) {
        console.log("남은영양 식품 추가 중 오류: ", e);
      }
      dispatch(setMenuAcActive([]));
      dispatch(setTutorialProgress("Complete"));
      isFormulaPage ? dispatch(setFormulaProgress(["Formula"])) : router.back();
      if (!autoMenuResult?.resultSummaryObj) return;
      const { isBudgetExceeded } = autoMenuResult.resultSummaryObj;
      !isTutorialMode &&
        isBudgetExceeded &&
        dispatch(openModal({ name: "autoMenuOverPriceAlert" }));
    };
    addMenu();
  }, [isSuccess]);

  console.log(
    "Processing: isLoading:",
    isLoading,
    " isError:",
    isError,
    "autoMenuResult:",
    autoMenuResult
  );

  if (isError) {
    return <Error />;
  }
  return (
    <Col style={{ justifyContent: "center", marginTop: 64 }}>
      <ActivityIndicator size={"large"} color={colors.main} />
    </Col>
  );
};

export default Processing;
