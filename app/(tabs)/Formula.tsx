import colors from "@/shared/colors";
import { SCREENWIDTH } from "@/shared/constants";
import BackArrow from "@/shared/ui/BackArrow";
import CtaButton from "@/shared/ui/CtaButton";
import GuideTitle from "@/shared/ui/GuideTitle";
import { Col, Container } from "@/shared/ui/styledComps";
import {
  getPageItem,
  IFormulaPageNm,
} from "@/shared/utils/screens/formula/contentByPages";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ScrollView, BackHandler } from "react-native";
import styled from "styled-components/native";

const Formula = () => {
  // navigation
  const router = useRouter();
  const { setOptions } = useNavigation();

  // useState
  const [progress, setProgress] = useState<IFormulaPageNm[]>(["Start"]);

  // useRef
  const scrollRef = useRef<ScrollView | null>(null);

  // etc
  const currentPage = progress[progress.length - 1];
  const goNext = (nextPage: IFormulaPageNm) => {
    setProgress((v) => [...v, nextPage]);
  };
  const goPrev = () => {
    setProgress((v) => v.slice(0, v.length - 1));
  };
  const goStart = () => {
    setProgress(["Start"]);
  };

  const onCtaPress = () => {
    goNext(getPageItem(currentPage).getNextPage());
  };

  // Cta 버튼 설정
  const btnStyle = getPageItem(currentPage).checkIsActive()
    ? "active"
    : "inactive";

  const btnText = "다음";

  const numerator = parseInt(getPageItem(currentPage).header.split("/")[0]);
  const denominator = parseInt(getPageItem(currentPage).header.split("/")[1]);

  // useEffect
  // headerTitle 설정
  useEffect(() => {
    setOptions({
      headerTitle:
        currentPage === "Start" ? "" : `${getPageItem(currentPage).header}`,
      headerLeft: () => (
        <BackArrow
          goBackFn={() => (currentPage === "Start" ? router.back() : goPrev())}
        />
      ),
    });
  }, [progress]);

  // android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentPage === "Start") return false;

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
    <Container style={{ backgroundColor: colors.white }}>
      <ProgressBox>
        <Progress.Bar
          progress={numerator / denominator}
          width={null}
          height={4}
          color={colors.main}
          unfilledColor={colors.backgroundLight2}
          borderWidth={0}
        />
      </ProgressBox>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingBottom: 200,
        }}
        scrollEnabled={currentPage === "Start" ? false : true}
        showsVerticalScrollIndicator={false}
      >
        <GuideTitle
          style={{
            marginTop: 48,
            marginBottom: 64,
          }}
          title={getPageItem(currentPage).title}
          subTitle={getPageItem(currentPage).subTitle}
        />

        {/* 각 페이지 내용 */}
        {getPageItem(currentPage).render(scrollRef)}
      </ScrollView>

      {/* CTA버튼 */}
      <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={96}>
        <Col style={{ rowGap: 12 }}>
          <CtaButton
            btnStyle={btnStyle}
            btnText={btnText}
            onPress={() => onCtaPress()}
          />
        </Col>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default Formula;

const ProgressBox = styled.View`
  width: ${SCREENWIDTH - 32}px;
  height: 4px;
`;

const KeyboardAvoidingView = styled.KeyboardAvoidingView`
  margin-top: -120px;
  bottom: 24px;
`;
