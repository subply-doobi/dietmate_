// RN, expo
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView } from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";

// 3rd
import * as Progress from "react-native-progress";
import { styled } from "styled-components/native";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/store/reduxStore";

// doobi
import { IS_IOS, SCREENWIDTH } from "@/shared/constants";
import colors from "@/shared/colors";
import { Col, Container, Row } from "@/shared/ui/styledComps";
import GuideTitle from "@/shared/ui/GuideTitle";
import BackArrow from "@/shared/ui/BackArrow";
import { getPageItem } from "@/shared/utils/screens/userInput/pageIdx";
import CtaButton from "@/shared/ui/CtaButton";
import { setSubmitData } from "@/shared/utils/screens/userInput/userInfoSubmit";
import {
  useGetBaseLine,
  useUpdateBaseLine,
  useCreateBaseLine,
} from "@/shared/api/queries/baseLine";

const UserInput = () => {
  // redux
  const userInputState = useSelector((state: RootState) => state.userInput);

  // navigation
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setOptions } = useNavigation();

  // react-query
  const { data: baseLineData } = useGetBaseLine();
  const updateBaseLineMutation = useUpdateBaseLine();
  const createBaseLineMutation = useCreateBaseLine();

  // useState
  const [progress, setProgress] = useState<string[]>(["Start"]);

  // useRef
  const scrollRef = useRef<ScrollView | null>(null);

  // etc
  const currentPage = progress[progress.length - 1];
  const goNext = (nextPage: string) => {
    setProgress((v) => [...v, nextPage]);
  };
  const goPrev = () => {
    setProgress((v) => v.slice(0, v.length - 1));
  };
  const goStart = () => {
    setProgress(["Start"]);
  };
  const onComplete = async () => {
    const requestBody = setSubmitData(userInputState);

    !baseLineData || Object.keys(baseLineData).length === 0
      ? await createBaseLineMutation.mutateAsync(requestBody)
      : await updateBaseLineMutation.mutateAsync(requestBody);

    router.canDismiss() && router.dismissAll();
    router.replace({ pathname: "/(tabs)" });
    setProgress(["Start"]);
  };

  const onCtaPress = () => {
    if (
      currentPage === "Result" ||
      currentPage === "ChangeResult" ||
      currentPage === "ResultSimple"
    ) {
      onComplete();
      return;
    }
    goNext(getPageItem(currentPage).getNextPage(userInputState));
  };

  // Cta 버튼 설정
  const btnStyle = getPageItem(currentPage).checkIsActive(userInputState)
    ? "active"
    : "inactive";

  const btnText =
    currentPage === "TargetCalorie"
      ? `${userInputState.calorie.value} kcal 로 결정`
      : "다음";

  const numerator = parseInt(getPageItem(currentPage).header.split("/")[0]);
  const denominator = parseInt(getPageItem(currentPage).header.split("/")[1]);

  // useEffect
  // headerTitle 설정
  useEffect(() => {
    setOptions({
      headerTitle:
        currentPage === "Start" || currentPage === "CalculationOptions"
          ? ""
          : `${getPageItem(currentPage).header}`,
      headerLeft: () => (
        <BackArrow
          goBackFn={() => (currentPage === "Start" ? router.back() : goPrev())}
        />
      ),
      headerRight: () =>
        currentPage === "Start" ||
        currentPage === "CalculationOptions" ? null : (
          <GoStartBtn onPressIn={() => goStart()}>
            <GoStartBtnText>처음으로</GoStartBtnText>
          </GoStartBtn>
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

  useEffect(() => {
    params.from === "Checklist" && setProgress(["Start", "ChangeWeight"]);
  }, [params.from]);

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
      <KeyboardAvoidingView
        behavior={IS_IOS ? "padding" : "height"}
        // enabled={IS_IOS}
        keyboardVerticalOffset={96}
      >
        {currentPage !== "CalculationOptions" ? (
          <Col style={{ rowGap: 12 }}>
            {currentPage === "Start" &&
              baseLineData &&
              Object.keys(baseLineData).length !== 0 && (
                <>
                  <CtaButton
                    btnStyle="border"
                    btnText="몸무게, 목표영양만 변경하기"
                    onPress={() => goNext("ChangeWeight")}
                  />
                </>
              )}
            <CtaButton
              btnStyle={btnStyle}
              btnText={btnText}
              onPress={() => onCtaPress()}
            />
          </Col>
        ) : (
          <Row style={{ columnGap: 8 }}>
            <CtaButton
              btnStyle="border"
              btnText="자세하게"
              onPress={() => goNext("Gender")}
              style={{ flex: 1 }}
            />
            <CtaButton
              btnStyle="active"
              btnText="간단하게"
              onPress={() => goNext("GenderSimple")}
              style={{ flex: 1 }}
            />
          </Row>
        )}
      </KeyboardAvoidingView>
    </Container>
  );
};

export default UserInput;

const ProgressBox = styled.View`
  width: ${SCREENWIDTH - 32}px;
  height: 4px;
`;

const GoStartBtn = styled.TouchableOpacity`
  height: 32px;
  justify-content: center;
  align-items: center;
`;
const GoStartBtnText = styled.Text`
  font-size: 12px;
  color: ${colors.textMain};
`;

const KeyboardAvoidingView = styled.KeyboardAvoidingView`
  margin-top: -120px;
  bottom: 24px;
`;
