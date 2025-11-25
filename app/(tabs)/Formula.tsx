// RN, expo
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { BackHandler } from "react-native";

// doobi
import colors from "@/shared/colors";
import GuideTitle from "@/shared/ui/GuideTitle";
import { ScreenContainer } from "@/shared/ui/styledComps";
import { getPageItem } from "@/shared/utils/screens/formula/contentByPages";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  openBS,
  closeBS,
  closeBSAll,
} from "@/features/reduxSlices/bottomSheetSlice";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";

const Formula = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.formula.formulaProgress);
  const pToDel = useAppSelector((state) => state.bottomSheet.bsData.pToDel);
  const bsNmArr = useAppSelector((state) => state.bottomSheet.bsNmArr);
  const isFocused = useIsFocused();

  // etc
  const currentPage = progress[progress.length - 1];
  const pageTitle = getPageItem(currentPage)?.title || "";
  const pageSubTitle = getPageItem(currentPage)?.subTitle || "";
  const goPrev = () => {
    progress.length <= 1
      ? router.back()
      : // setProgress((v) => v.slice(0, v.length - 1));
        dispatch(setFormulaProgress(progress.slice(0, progress.length - 1)));
  };

  // useEffect
  useEffect(() => {
    dispatch(setFormulaProgress(["SelectNumOfMenu"]));
  }, []);

  // android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentPage === "SelectNumOfMenu") return false;

        goPrev();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [progress])
  );

  // bottom sheet open/close logic (moved from subScreens/Formula.tsx)
  useEffect(() => {
    if (currentPage !== "Formula") {
      dispatch(closeBSAll());
      return;
    }

    if (isFocused) {
      if (pToDel.length > 0) {
        dispatch(
          openBS({
            bsNm: "productToDelSelect",
            from: "Formula.tsx",
            option: "reset",
          })
        );
      } else {
        dispatch(
          openBS({
            bsNm: "summaryInfo",
            from: "Formula.tsx",
            option: "reset",
          })
        );
      }
      return;
    }

    bsNmArr.includes("summaryInfo") &&
      dispatch(closeBS({ bsNm: "summaryInfo", from: "Formula.tsx" }));
    bsNmArr.includes("productToDelSelect") &&
      dispatch(closeBS({ bsNm: "productToDelSelect", from: "Formula.tsx" }));
  }, [pToDel, isFocused, currentPage, bsNmArr]);
  return (
    <ScreenContainer
      style={{ backgroundColor: colors.white, paddingHorizontal: 0 }}
    >
      {pageTitle && (
        <GuideTitle
          style={{
            marginTop: 48,
            marginBottom: 64,
            marginLeft: 18,
          }}
          title={pageTitle}
          subTitle={pageSubTitle}
        />
      )}

      {/* 각 페이지 내용 */}
      {getPageItem(currentPage)?.render()}
    </ScreenContainer>
  );
};

export default Formula;
