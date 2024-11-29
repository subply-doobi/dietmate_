import { ICodeData } from "@/shared/api/types/code";
import { IUserInputState } from "@/features/reduxSlices/userInputSlice";
import { getRecommendedNutr } from "./targetByUserInfo";

// 자동계산
export const setSubmitDataByAuto = (
  userInputState: IUserInputState,
  seqCodeData: ICodeData | undefined,
  timeCodeData: ICodeData | undefined,
  strengthCodeData: ICodeData | undefined
) => {
  const { calorie, carb, protein, fat } = getRecommendedNutr(
    seqCodeData,
    timeCodeData,
    strengthCodeData,
    userInputState
  );
  return {
    calorie,
    carb,
    protein,
    fat,
    gender: userInputState.gender.value,
    age: userInputState.age.value,
    height: userInputState.height.value,
    weight: userInputState.weight.value,
    dietPurposeCd: userInputState.dietPurposeCd.value,
    sportsSeqCd: userInputState.sportsSeqCd.value,
    sportsTimeCd: userInputState.sportsTimeCd.value,
    sportsStrengthCd: userInputState.sportsStrengthCd.value,
  };
};
// 영양비율, 칼로리 입력
export const setSubmitDataByRatio = (userInputState: IUserInputState) => {
  return {
    calorie: userInputState.calorie.value,
    carb: userInputState.carb.value,
    protein: userInputState.protein.value,
    fat: userInputState.fat.value,
    gender: userInputState.gender.value,
    age: userInputState.age.value,
    height: userInputState.height.value,
    weight: userInputState.weight.value,
    dietPurposeCd: userInputState.dietPurposeCd.value,
    sportsSeqCd: userInputState.sportsSeqCd.value,
    sportsTimeCd: userInputState.sportsTimeCd.value,
    sportsStrengthCd: userInputState.sportsStrengthCd.value,
  };
};

// 탄단지 직접입력
export const setSubmitData = (userInputState: IUserInputState) => {
  const targetOption =
    userInputState.targetOption.value[0] === 3 ? "manual" : "ratio";
  const calorie =
    targetOption === "manual"
      ? String(
          parseInt(userInputState.carb.value) * 4 +
            parseInt(userInputState.protein.value) * 4 +
            parseInt(userInputState.fat.value) * 9
        )
      : userInputState.calorie.value;

  return {
    calorie,
    carb: userInputState.carb.value,
    protein: userInputState.protein.value,
    fat: userInputState.fat.value,
    gender: userInputState.gender.value,
    age: userInputState.age.value,
    height: userInputState.height.value,
    weight: userInputState.weight.value,
    dietPurposeCd: userInputState.dietPurposeCd.value,
    sportsSeqCd: userInputState.sportsSeqCd.value,
    sportsTimeCd: userInputState.sportsTimeCd.value,
    sportsStrengthCd: userInputState.sportsStrengthCd.value,
  };
};
