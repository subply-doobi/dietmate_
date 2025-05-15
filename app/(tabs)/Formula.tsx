// RN, expo
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";

// 3rd
import styled from "styled-components/native";
import * as Progress from "react-native-progress";

// doobi
import { SCREENWIDTH } from "@/shared/constants";
import colors from "@/shared/colors";
import BackArrow from "@/shared/ui/BackArrow";
import GuideTitle from "@/shared/ui/GuideTitle";
import { Container } from "@/shared/ui/styledComps";
import { getPageItem } from "@/shared/utils/screens/formula/contentByPages";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";

const Formula = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.formula.formulaProgress);

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

  return (
    <Container style={{ backgroundColor: colors.white, paddingHorizontal: 0 }}>
      <BackArrow style={{ marginLeft: 8 }} goBackFn={() => goPrev()} />
      <ProgressBox>
        <Progress.Bar
          progress={getPageItem(currentPage)?.progress || 0}
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
  width: ${SCREENWIDTH - 32}px;
  align-self: center;
  height: 4px;
`;
