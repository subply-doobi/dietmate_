import {
  purposeCdToValue,
  ratioCdToValue,
  timeCdToMinutes,
} from "../constants";
import { IBaseLineData } from "../api/types/baseLine";

/** gender, age, height, weight  => BMR */
export const calculateBMR = (
  gender: string,
  age: string,
  height: string,
  weight: string
) => {
  const weightMod = parseFloat(weight) > 120 ? 120 : parseFloat(weight);
  const ageMod = parseFloat(age) > 100 ? 100 : parseFloat(age);
  if (gender === "M") {
    return String(
      (10 * weightMod + 6.25 * parseFloat(height) - 5 * ageMod + 5).toFixed()
    );
  } else if (gender === "F") {
    return String(
      (10 * weightMod + 6.25 * parseFloat(height) - 5 * ageMod - 161).toFixed()
    );
  } else {
    return "";
  }
};

/** bmr, weightTimeCd, aerobicTimeCd => TMR */
export const calculateNutrTarget = (
  weight: string,
  frequency: number,
  mets: number,
  duration: number,
  dietPurposecd: string,
  bmr: string,
  amrKnown?: string
) => {
  const weightMod = parseFloat(weight) > 120 ? 120 : parseFloat(weight);
  // const wcal = 0.0175 * 6 * parseFloat(weight) * timeCdToMinutes[weightTimeCd];
  // const acal = 0.0175 * 7 * parseFloat(weight) * timeCdToMinutes[aerobicTimeCd];
  // 하루 평균 운동시간 (분)
  const avgDuration = (duration * frequency) / 7;
  // 하루 평균 활동 칼로리
  const aCal = amrKnown
    ? parseFloat(amrKnown)
    : 0.0175 * mets * weightMod * avgDuration;
  const amr = aCal + parseFloat(bmr) * 0.2;
  const tmr = parseFloat(bmr) + amr;
  const calorieTarget =
    tmr + parseInt(purposeCdToValue[dietPurposecd].additionalCalorie);
  const carbTarget = (calorieTarget * 0.55) / 4;
  const proteinTarget = (calorieTarget * 0.2) / 4;
  const fatTarget = (calorieTarget * 0.25) / 9;

  return {
    tmr: String(Math.round(tmr)),
    calorie: String(Math.round(calorieTarget)),
    carb: String(Math.round(carbTarget)),
    protein: String(Math.round(proteinTarget)),
    fat: String(Math.round(fatTarget)),
  };
};

export const calculateCaloriesToNutr = (ratioCd: string, calorie: string) => {
  const cal = calorie ? parseFloat(calorie) : 0;
  const c =
    cal === 0 ? 0 : (cal * parseFloat(ratioCdToValue[ratioCd].carbRatio)) / 4;
  const p =
    cal === 0
      ? 0
      : (cal * parseFloat(ratioCdToValue[ratioCd].proteinRatio)) / 4;
  const f =
    cal === 0 ? 0 : (cal * parseFloat(ratioCdToValue[ratioCd].fatRatio)) / 9;

  return {
    carb: String(Math.round(c)),
    protein: String(Math.round(p)),
    fat: String(Math.round(f)),
  };
};

export const calculateManualCalorie = (
  carb: string,
  protein: string,
  fat: string
) => {
  const c = carb ? parseFloat(carb) : 0;
  const p = protein ? parseFloat(protein) : 0;
  const f = fat ? parseFloat(fat) : 0;
  const totalCalorie = c * 4 + p * 4 + f * 9;
  const carbRatio =
    totalCalorie == 0 ? "    " : Math.round(((c * 4) / totalCalorie) * 100);
  const proteinRatio =
    totalCalorie == 0 ? "    " : Math.round(((p * 4) / totalCalorie) * 100);
  const fatRatio =
    totalCalorie == 0 ? "    " : Math.round(((f * 9) / totalCalorie) * 100);

  return {
    totalCalorie: String(totalCalorie),
    carbRatio: String(carbRatio),
    proteinRatio: String(proteinRatio),
    fatRatio: String(fatRatio),
  };
};
