// RN
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  BackHandler,
  ActivityIndicator,
  Platform,
} from "react-native";

// doobi
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import {
  IAutoMenuSubPageNm,
  PAGES,
} from "@/shared/utils/screens/autoMenu/contentByPages";
import colors from "@/shared/colors";

import { Container } from "@/shared/ui/styledComps";
import BackArrow from "@/shared/ui/BackArrow";
import GuideTitle from "@/shared/ui/GuideTitle";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { BOTTOM_INDICATOR_IOS } from "@/shared/constants";

const AutoMenu = () => {
  // redux
  const dispatch = useAppDispatch();
  const { isTutorialMode, tutorialProgress } = useAppSelector(
    (RootState) => RootState.common
  );
  const { selectedDietNo, selectedCategory } = useAppSelector(
    (RootState) => RootState.autoMenu
  );

  // navigation
  const router = useRouter();
  const { setOptions } = useNavigation();

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useState
  const [progress, setProgress] = useState<IAutoMenuSubPageNm[]>(["AMSelect"]);
  // etc
  const currentPage =
    progress.length > 0 ? progress[progress.length - 1] : "Select";

  // etc
  const goPrev = () => {
    setProgress((v) => v.slice(0, v.length - 1));
  };

  const guideStyle =
    currentPage === "AMProcessing" ? { marginTop: 140 } : { marginTop: 40 };
  const guideTitle = PAGES.find((p) => p.name === currentPage)?.title || "";
  const guideSubTitle =
    PAGES.find((p) => p.name === currentPage)?.subTitle || "";
  const guideTitleAlign =
    PAGES.find((p) => p.name === currentPage)?.name === "AMProcessing"
      ? "center"
      : "left";

  // headerTitle 설정
  useEffect(() => {
    if (progress.length === 1) {
      setOptions({
        headerLeft: () =>
          isTutorialMode && tutorialProgress === "AutoMenu" ? (
            <></>
          ) : (
            <BackArrow goBackFn={() => router.back()} />
          ),
      });
      return;
    }
    if (currentPage === "AMProcessing" || currentPage === "AMError") {
      setOptions({
        headerLeft: () => <></>,
      });
      return;
    }
    setOptions({
      headerLeft: () => <BackArrow goBackFn={goPrev} />,
    });
  }, [progress]);

  // android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isTutorialMode && tutorialProgress === "AutoMenu") return true;
        if (progress.length === 1) return false;
        if (currentPage === "AMProcessing" || currentPage === "AMError") {
          return true;
        }

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

  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;

  return (
    <Container style={{ backgroundColor: colors.white }}>
      <GuideTitle
        style={guideStyle}
        title={guideTitle}
        subTitle={guideSubTitle}
        titleAlign={guideTitleAlign}
      />
      {!dTOData ? (
        <ActivityIndicator
          size="large"
          color={colors.main}
          style={{ marginTop: 64 }}
        />
      ) : (
        PAGES.find((p) => p.name === currentPage)?.render(setProgress)
      )}
    </Container>
  );
};

export default AutoMenu;
