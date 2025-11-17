import { setAMSettingProgress } from "@/features/reduxSlices/autoMenuSlice";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import GuideTitle from "@/shared/ui/GuideTitle";
import Icon from "@/shared/ui/Icon";
import { ScreenContainer } from "@/shared/ui/styledComps";
import { getPageItem } from "@/shared/utils/screens/formula/contentByPages";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler, Pressable } from "react-native";
import * as Progress from "react-native-progress";
import styled from "styled-components/native";

const AmSettings = () => {
  // navigation
  const router = useRouter();
  const { setOptions } = useNavigation();
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.autoMenu.settingProgress);

  const currentPage = progress[progress.length - 1];
  const pageTitle = getPageItem(currentPage)?.title || "";
  const pageSubTitle = getPageItem(currentPage)?.subTitle || "";

  const goPrev = () => {
    progress.length > 1
      ? dispatch(setAMSettingProgress(progress.slice(0, -1)))
      : router.back();
  };

  useEffect(() => {
    setOptions({
      headerLeft: () => (
        <Pressable onPress={() => goPrev()}>
          <Icon name="arrowLeft" />
        </Pressable>
      ),
    });
  }, [goPrev]);

  // android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        goPrev();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <ProgressBox>
        <Progress.Bar
          progress={progress.length / 3}
          width={null}
          height={4}
          color={colors.main}
          unfilledColor={colors.backgroundLight2}
          borderWidth={0}
        />
      </ProgressBox>
      <GuideTitle
        style={{
          marginTop: 48,
          marginBottom: 64,
          marginLeft: 18,
        }}
        title={pageTitle}
        subTitle={pageSubTitle}
      />
      {getPageItem(currentPage)?.render()}
    </ScreenContainer>
  );
};

export default AmSettings;

const ProgressBox = styled.View`
  background-color: ${colors.backgroundLight2};
  padding: 0 16px;
  height: 4px;
`;
