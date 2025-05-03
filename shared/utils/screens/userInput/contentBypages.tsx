// RN
import { RefObject } from "react";
import { ScrollView } from "react-native";

// doobi
import Start from "@/components/screens/userInput/subScreens/Start";
import Age from "@/components/screens/userInput/subScreens/Age";
import Amr from "@/components/screens/userInput/subScreens/Amr";
import Height from "@/components/screens/userInput/subScreens/Height";
import Purpose from "@/components/screens/userInput/subScreens/Purpose";
import Gender from "@/components/screens/userInput/subScreens/Gender";
import TargetRatio from "@/components/screens/userInput/subScreens/TargetRatio";
import WODuration from "@/components/screens/userInput/subScreens/WODuration";
import WOFrequency from "@/components/screens/userInput/subScreens/WOFrequency";
import WOIntensity from "@/components/screens/userInput/subScreens/WOIntensity";
import Weight from "@/components/screens/userInput/subScreens/Weight";
import Result from "@/components/screens/userInput/subScreens/Result";
import TargetCalorie from "@/components/screens/userInput/subScreens/TargetCalorie";
import ChangeWeight from "@/components/screens/userInput/subScreens/ChangeWeight";
import ChangeCalorie from "@/components/screens/userInput/subScreens/ChangeCalorie";
import ChangeResult from "@/components/screens/userInput/subScreens/ChangeResult";

import { IUserInputState } from "@/features/reduxSlices/userInputSlice";
import { SPORTS_SEQ_CD } from "@/shared/constants";
import ResultSimple from "@/components/screens/userInput/subScreens/ResultSimple";
export type IUserInputPageNm =
  | "Start"
  | "CalculationOptions"
  | "Gender"
  | "Age"
  | "Height"
  | "Weight"
  | "Purpose"
  | "WOFrequency"
  | "Amr"
  | "WODuration"
  | "WOIntensity"
  | "TargetCalorie"
  | "TargetRatio"
  | "Result"
  | "ChangeWeight"
  | "ChangeCalorie"
  | "ChangeRatio"
  | "ChangeResult"
  | "None";

export const PAGES = [
  // 자세히 계산하기
  {
    header: "0/12",
    name: "Start",
    title: "목적에 따라 목표로 할\n영양성분 양을 정해드릴게요",
    subTitle: "입력된 정보로 목표 칼로리를 계산해드려요",
    getNextPage: (u: IUserInputState) => "CalculationOptions",
    checkIsActive: (u: IUserInputState) => true,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Start userInputState={u} />
    ),
  },
  {
    header: "0/12",
    name: "CalculationOptions",
    title: "한 끼 영양성분 목표를 위해\n계산 방식을 선택해주세요",
    subTitle:
      '"자세하게"는 운동량도 고려하고\n영양성분 비율도 직접 선택할 수 있어요',
    getNextPage: (u: IUserInputState) => "None",
    checkIsActive: (u: IUserInputState) => true,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => null,
  },
  {
    header: "1/12",
    name: "Gender",
    title: "성별을 알려주세요",
    subTitle: "성별에 따라\n열량소모가 달라져요",
    getNextPage: (u: IUserInputState) => "Age",
    checkIsActive: (u: IUserInputState) => u.gender.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Gender userInputState={u} />
    ),
  },
  {
    header: "2/12",
    name: "Age",
    title: "만 나이를 알려주세요",
    subTitle: "한 두 살 차이가\n크게 영향을 미치지는 않아요",
    getNextPage: (u: IUserInputState) => "Height",
    checkIsActive: (u: IUserInputState) => u.age.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Age userInputState={u} />
    ),
  },
  {
    header: "3/12",
    name: "Height",
    title: "신장을 알려주세요",
    subTitle: "키가 크면 열량 소모가 커집니다\n몸을 크게 만드는데는 불리하겠죠",
    getNextPage: (u: IUserInputState) => "Weight",
    checkIsActive: (u: IUserInputState) => u.height.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Height userInputState={u} />
    ),
  },
  {
    header: "4/12",
    name: "Weight",
    title: "체중을 알려주세요",
    subTitle:
      "체중이 높을수록 열량 소모가 커져요\n체중 감량을 위해 덜 먹어야겠죠?",
    getNextPage: (u: IUserInputState) => "Purpose",
    checkIsActive: (u: IUserInputState) => u.weight.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Weight userInputState={u} />
    ),
  },
  {
    header: "5/12",
    name: "Purpose",
    title: "어떤 목적을 위해\n식단을 하나요",
    subTitle: "어렵지 않아요\n체중감소는 덜먹고, 체중증가는 더 먹고!",
    getNextPage: (u: IUserInputState) => "WOFrequency",
    checkIsActive: (u: IUserInputState) => u.dietPurposeCd.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Purpose userInputState={u} />
    ),
  },
  {
    header: "6/12",
    name: "WOFrequency",
    title: "일주일에 운동을\n몇 번이나 하는지 알려주세요",
    subTitle: "운동을 많이, 오래 할수록\n먹을 수 있는 양이 많아지겠죠?",
    getNextPage: (u: IUserInputState) =>
      u.sportsSeqCd.value === SPORTS_SEQ_CD[0].cd ? "TargetCalorie" : "Amr",
    checkIsActive: (u: IUserInputState) => u.sportsSeqCd.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <WOFrequency userInputState={u} />
    ),
  },
  {
    header: "7/12",
    name: "Amr",
    title: "기초대사량과 운동으로 소모하는\n열량을 알고 계신가요",
    subTitle: "모르신다면\n입력 없이 다음으로 넘어가주세요",
    getNextPage: (u: IUserInputState) =>
      u.amrKnown.value !== "" && u.amrKnown.isValid
        ? "TargetCalorie"
        : "WODuration",
    checkIsActive: (u: IUserInputState) =>
      u.bmrKnown.isValid && u.amrKnown.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Amr userInputState={u} scrollRef={scrollRef} />
    ),
  },
  {
    header: "8/12",
    name: "WODuration",
    title: "운동은 평균적으로\n몇 분 동안 하나요",
    subTitle: "운동을 많이, 오래 할수록\n먹을 수 있는 양이 많아지겠죠?",
    getNextPage: (u: IUserInputState) => "WOIntensity",
    checkIsActive: (u: IUserInputState) => u.sportsTimeCd.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <WODuration userInputState={u} />
    ),
  },
  {
    header: "9/12",
    name: "WOIntensity",
    title: "어떤 강도로\n운동을 하는지 알려주세요",
    subTitle: "운동을 많이, 오래 할수록\n먹을 수 있는 양이 많아지겠죠?",
    getNextPage: (u: IUserInputState) => "TargetCalorie",
    checkIsActive: (u: IUserInputState) => u.sportsStrengthCd.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <WOIntensity userInputState={u} />
    ),
  },
  {
    header: "10/12",
    name: "TargetCalorie",
    title: "한 끼니 기준\n목표 칼로리를 정해봐요",
    subTitle: "평소 섭취하는 끼니에 따라\n목표섭취량을 계산해드릴게요",
    getNextPage: (u: IUserInputState) => "TargetRatio",
    checkIsActive: (u: IUserInputState) => u.calorie.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <TargetCalorie userInputState={u} scrollRef={scrollRef} />
    ),
  },
  {
    header: "11/12",
    name: "TargetRatio",
    title: "거의 다 왔어요!\n영양성분 비율을 선택해주세요",
    subTitle: "잘 모르겠다면 첫번째로\n선택해주시면 됩니다",
    getNextPage: (u: IUserInputState) => "Result",
    checkIsActive: (u: IUserInputState) => {
      if (u.targetOption.value.length === 0) return false;
      if (
        u.targetOption.value[0] === 3 &&
        (!u.carb.isValid || !u.protein.isValid || !u.fat.isValid)
      )
        return false;

      return true;
    },
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <TargetRatio userInputState={u} scrollRef={scrollRef} />
    ),
  },
  {
    header: "12/12",
    name: "Result",
    title: "목표섭취량 계산이\n완료되었어요",
    subTitle: "목표섭취량은 홈화면 목표변경에서\n언제든지 변경이 가능합니다",
    getNextPage: (u: IUserInputState) => "None",
    checkIsActive: (u: IUserInputState) => true,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Result userInputState={u} />
    ),
  },
  // 간단하게 계산하기
  {
    header: "1/6",
    name: "GenderSimple",
    title: "성별을 알려주세요",
    subTitle: "성별에 따라\n열량소모가 달라져요",
    getNextPage: (u: IUserInputState) => "AgeSimple",
    checkIsActive: (u: IUserInputState) => u.gender.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Gender userInputState={u} />
    ),
  },
  {
    header: "2/6",
    name: "AgeSimple",
    title: "만 나이를 알려주세요",
    subTitle: "한 두 살 차이가\n크게 영향을 미치지는 않아요",
    getNextPage: (u: IUserInputState) => "HeightSimple",
    checkIsActive: (u: IUserInputState) => u.age.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Age userInputState={u} />
    ),
  },
  {
    header: "3/6",
    name: "HeightSimple",
    title: "신장을 알려주세요",
    subTitle: "키가 크면 열량 소모가 커집니다\n몸을 크게 만드는데는 불리하겠죠",
    getNextPage: (u: IUserInputState) => "WeightSimple",
    checkIsActive: (u: IUserInputState) => u.height.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Height userInputState={u} />
    ),
  },
  {
    header: "4/6",
    name: "WeightSimple",
    title: "체중을 알려주세요",
    subTitle:
      "체중이 높을수록 열량 소모가 커져요\n체중 감량을 위해 덜 먹어야겠죠?",
    getNextPage: (u: IUserInputState) => "PurposeSimple",
    checkIsActive: (u: IUserInputState) => u.weight.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Weight userInputState={u} />
    ),
  },
  {
    header: "5/6",
    name: "PurposeSimple",
    title: "어떤 목적을 위해\n식단을 하나요",
    subTitle: "어렵지 않아요\n체중감소는 덜먹고, 체중증가는 더 먹고!",
    getNextPage: (u: IUserInputState) => "ResultSimple",
    checkIsActive: (u: IUserInputState) => u.dietPurposeCd.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <Purpose userInputState={u} />
    ),
  },
  {
    header: "6/6",
    name: "ResultSimple",
    title: "목표섭취량 계산이\n완료되었어요",
    subTitle: "목표섭취량은 홈화면 목표변경에서\n언제든지 변경이 가능합니다",
    getNextPage: (u: IUserInputState) => "None",
    checkIsActive: (u: IUserInputState) => true,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <ResultSimple userInputState={u} />
    ),
  },

  // 몸무게, 목표섭취량 변경
  {
    header: "1/4",
    name: "ChangeWeight",
    title: "몸무게와 목표영양을\n다시 설정할게요",
    subTitle: "체형, 체중이나 목적이 변한다면\n목표섭취량도 다시 설정해야해요",
    getNextPage: (u: IUserInputState) => "ChangeCalorie",
    checkIsActive: (u: IUserInputState) => u.weight.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <ChangeWeight userInputState={u} />
    ),
  },
  {
    header: "2/4",
    name: "ChangeCalorie",
    title: "몸무게와 목표영양을\n다시 설정할게요",
    subTitle: "체형, 체중이나 목적이 변한다면\n목표섭취량도 다시 설정해야해요",
    getNextPage: (u: IUserInputState) => "ChangeRatio",
    checkIsActive: (u: IUserInputState) => u.calorie.isValid,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <ChangeCalorie userInputState={u} scrollRef={scrollRef} />
    ),
  },
  {
    header: "3/4",
    name: "ChangeRatio",
    title: "영양성분 비율을\n다시 설정할게요",
    subTitle: "잘 모르겠다면 첫번째로\n선택해주시면 됩니다",
    getNextPage: (u: IUserInputState) => "ChangeResult",
    checkIsActive: (u: IUserInputState) => {
      if (u.targetOption.value.length === 0) return false;
      if (
        u.targetOption.value[0] === 3 &&
        (!u.carb.isValid || !u.protein.isValid || !u.fat.isValid)
      )
        return false;

      return true;
    },
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <TargetRatio userInputState={u} scrollRef={scrollRef} />
    ),
  },
  {
    header: "4/4",
    name: "ChangeResult",
    title: "몸무게와 목표영양을\n다시 설정할게요",
    subTitle: "체형, 체중이나 목적이 변한다면\n목표섭취량도 다시 설정해야해요",
    getNextPage: (u: IUserInputState) => "None",
    checkIsActive: (u: IUserInputState) => true,
    render: (u: IUserInputState, scrollRef: RefObject<ScrollView>) => (
      <ChangeResult userInputState={u} />
    ),
  },
];
