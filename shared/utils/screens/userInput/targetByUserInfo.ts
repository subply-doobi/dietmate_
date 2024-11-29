import {
  SPORTS_SEQ_CD,
  SPORTS_STRENGTH_CD,
  SPORTS_TIME_CD,
} from "@/shared/constants";
import { ICodeData } from "@/shared/api/types/code";
import { IUserInputState } from "@/features/reduxSlices/userInputSlice";
import {
  calculateBMR,
  calculateNutrTarget,
} from "@/shared/utils/targetCalculation";

export const getRecommendedNutr = (
  seqCode: ICodeData | undefined,
  timeCode: ICodeData | undefined,
  strengthCode: ICodeData | undefined,
  userInputState: IUserInputState
) => {
  const {
    gender,
    age,
    height,
    weight,
    dietPurposeCd,
    sportsSeqCd,
    sportsTimeCd,
    sportsStrengthCd,
    bmrKnown,
    amrKnown,
  } = userInputState;

  const seqCodeArr = seqCode ? seqCode : SPORTS_SEQ_CD;
  const timeCodeArr = timeCode ? timeCode : SPORTS_TIME_CD;
  const strengthCodeArr = strengthCode ? strengthCode : SPORTS_STRENGTH_CD;

  const bmr = !!bmrKnown.value
    ? bmrKnown.value
    : calculateBMR(gender.value, age.value, height.value, weight.value);

  // 잠들기 가능 | 산책 | 버틸만한 정도 | 못버팀 | 유언장 준비
  const intensityIdxToMets = [1.3, 2.3, 6.4, 8.0, 10];

  const frequency = seqCodeArr.findIndex(
    (item) => item.cd === sportsSeqCd.value
  );
  const durationIdx = timeCodeArr.findIndex(
    (item) => item.cd === sportsTimeCd.value
  );
  const intensityIdx = strengthCodeArr.findIndex(
    (item) => item.cd === sportsStrengthCd.value
  );

  const mets = intensityIdxToMets[intensityIdx];
  const duration = durationIdx * 30 + 15;

  const nutrTarget = calculateNutrTarget(
    weight.value,
    frequency,
    mets,
    duration,
    dietPurposeCd.value,
    bmr,
    amrKnown.value
  );

  return nutrTarget;
};
