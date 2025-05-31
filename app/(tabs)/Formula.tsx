// RN, expo
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { BackHandler } from "react-native";

// 3rd
import styled from "styled-components/native";
import * as Progress from "react-native-progress";

// doobi
import colors from "@/shared/colors";
import BackArrow from "@/shared/ui/BackArrow";
import GuideTitle from "@/shared/ui/GuideTitle";
import { Container } from "@/shared/ui/styledComps";
import { getPageItem } from "@/shared/utils/screens/formula/contentByPages";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { getNutrStatus } from "@/shared/utils/sumUp";

const Formula = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const progress = useAppSelector((state) => state.formula.formulaProgress);

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();

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

  // useMemo
  const formulaProgressValue = useMemo(() => {
    if (!dTOData) return 0;
    const isSuccessArr = Object.values(dTOData).map((item) => {
      const isSuccess =
        getNutrStatus({
          totalFoodList,
          dDData: item.dietDetail,
          bLData: bLData,
        }) === "satisfied";
      return isSuccess;
    });
    const isSuccessCount = isSuccessArr.filter((item) => item).length;
    const ratio = isSuccessCount / isSuccessArr.length;

    const formulaProgressValue = (5 + ratio * 5) / 10;

    return formulaProgressValue;
  }, [dTOData]);

  const progressValue: {
    [key: string]: number;
  } = {
    SelectNumOfMenu: 1 / 10,
    SelectMethod: 2 / 10,
    AMSelect: 3 / 10,
    AMCategory: 3.5 / 10,
    AMCompany: 4 / 10,
    AMPrice: 5 / 10,
    AMProcessing: 5 / 10,
    Formula: formulaProgressValue,
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

  return (
    <Container style={{ backgroundColor: colors.white, paddingHorizontal: 0 }}>
      {/* <BackArrow style={{ marginLeft: 8 }} goBackFn={() => goPrev()} /> */}
      <ProgressBox>
        <Progress.Bar
          progress={progressValue[currentPage] || 0}
          width={null}
          height={4}
          color={colors.main}
          unfilledColor={colors.backgroundLight2}
          borderWidth={0}
        />
      </ProgressBox>

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
    </Container>
  );
};

export default Formula;

const ProgressBox = styled.View`
  background-color: ${colors.backgroundLight2};
  padding: 0 16px;
  height: 4px;
`;
