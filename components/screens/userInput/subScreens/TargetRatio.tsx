// RN, expo
import { ScrollView, TouchableOpacity } from "react-native";
import { RefObject, useMemo } from "react";

// 3rd
import styled from "styled-components/native";
import Accordion from "react-native-collapsible/Accordion";

// doobi
import {
  IUserInputState,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import { useListCode } from "@/shared/api/queries/code";
import { HorizontalSpace } from "@/shared/ui/styledComps";
import { calculateCaloriesToNutr } from "@/shared/utils/targetCalculation";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { getRatioAcContent } from "@/shared/utils/screens/userInput/ratioAccordion";

interface ITargetRatio {
  userInputState: IUserInputState;
  scrollRef: RefObject<ScrollView>;
}
const TargetRatio = ({ userInputState, scrollRef }: ITargetRatio) => {
  // redux
  const dispatch = useAppDispatch();
  const { calorie, targetOption, carb, protein, fat } = userInputState;

  // react-query
  const { data: ratioCodeData } = useListCode("SP005"); // SP005 : 탄단지비율

  // useMemo
  const ratioAcContent = useMemo(() => {
    if (!ratioCodeData) return [];
    return getRatioAcContent(ratioCodeData, calorie.value);
  }, [ratioCodeData, calorie.value]);

  const updateSections = (actives: Array<number>) => {
    dispatch(setValue({ name: "targetOption", value: actives }));
    if (actives.length === 0) return;

    if (actives[0] === 3) {
      dispatch(setValue({ name: "carb", value: "" }));
      dispatch(setValue({ name: "protein", value: "" }));
      dispatch(setValue({ name: "fat", value: "" }));
      setTimeout(() => {
        scrollRef?.current?.scrollToEnd({ animated: true });
      }, 150);
      return;
    }

    const currentRatioCd =
      actives[0] === 0
        ? "SP005001"
        : actives[0] === 1
        ? "SP005002"
        : actives[0] === 2
        ? "SP005003"
        : "";

    const { carb, protein, fat } = calculateCaloriesToNutr(
      currentRatioCd,
      calorie.value
    );
    dispatch(setValue({ name: "carb", value: carb }));
    dispatch(setValue({ name: "protein", value: protein }));
    dispatch(setValue({ name: "fat", value: fat }));
  };

  return (
    <Container>
      <Accordion
        activeSections={targetOption.value}
        sections={ratioAcContent}
        touchableComponent={TouchableOpacity}
        renderHeader={(section, _, isActive) =>
          isActive ? section.activeHeader : section.inactiveHeader
        }
        renderContent={(section) => section.content}
        duration={200}
        onChange={updateSections}
        renderFooter={() => <HorizontalSpace height={20} />}
        containerStyle={{ marginTop: 32 }}
      />
    </Container>
  );
};

export default TargetRatio;

const Container = styled.View``;
