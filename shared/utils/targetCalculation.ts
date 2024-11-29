import {purposeCdToValue, ratioCdToValue, timeCdToMinutes} from '../constants';
import {IBaseLineData} from '../api/types/baseLine';

/** gender, age, height, weight  => BMR */
export const calculateBMR = (
  gender: string,
  age: string,
  height: string,
  weight: string,
) => {
  if (gender === 'M') {
    return String(
      (
        10 * parseFloat(weight) +
        6.25 * parseFloat(height) -
        5 * parseFloat(age) +
        5
      ).toFixed(),
    );
  } else if (gender === 'F') {
    return String(
      (
        10 * parseFloat(weight) +
        6.25 * parseFloat(height) -
        5 * parseFloat(age) -
        161
      ).toFixed(),
    );
  } else {
    return '';
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
  amrKnown?: string,
) => {
  // const wcal = 0.0175 * 6 * parseFloat(weight) * timeCdToMinutes[weightTimeCd];
  // const acal = 0.0175 * 7 * parseFloat(weight) * timeCdToMinutes[aerobicTimeCd];
  // 하루 평균 운동시간 (분)
  const avgDuration = (duration * frequency) / 7;
  // 하루 평균 활동 칼로리
  const aCal = amrKnown
    ? parseFloat(amrKnown)
    : 0.0175 * mets * parseFloat(weight) * avgDuration;
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
  fat: string,
) => {
  const c = carb ? parseFloat(carb) : 0;
  const p = protein ? parseFloat(protein) : 0;
  const f = fat ? parseFloat(fat) : 0;
  const totalCalorie = c * 4 + p * 4 + f * 9;
  const carbRatio =
    totalCalorie == 0 ? '    ' : Math.round(((c * 4) / totalCalorie) * 100);
  const proteinRatio =
    totalCalorie == 0 ? '    ' : Math.round(((p * 4) / totalCalorie) * 100);
  const fatRatio =
    totalCalorie == 0 ? '    ' : Math.round(((f * 9) / totalCalorie) * 100);

  // console.log(c, p, f, totalCalorie, carbRatio, proteinRatio, fatRatio);

  return {
    totalCalorie: String(totalCalorie),
    carbRatio: String(carbRatio),
    proteinRatio: String(proteinRatio),
    fatRatio: String(fatRatio),
  };
};

const convertByCalorie = (
  targetCalorie: string,
  calorieValueForMod: string,
) => {
  const calorie = parseFloat(calorieValueForMod);
  const carb = (calorie * parseFloat(ratioCdToValue.SP005001.carbRatio)) / 4;
  const protein =
    (calorie * parseFloat(ratioCdToValue.SP005001.proteinRatio)) / 4;
  const fat = (calorie * parseFloat(ratioCdToValue.SP005001.fatRatio)) / 9;
  return {
    calorie: String(calorie),
    carb: String(Math.round(carb)),
    protein: String(Math.round(protein)),
    fat: String(Math.round(fat)),
  };
};

const convertByCarb = (targetCalorie: string, carbForMod: string) => {
  const calorie = parseFloat(targetCalorie);
  const carb = parseFloat(carbForMod);
  const proteinRatio = parseFloat(ratioCdToValue.SP005001.proteinRatio);
  const fatRatio = parseFloat(ratioCdToValue.SP005001.proteinRatio);
  const protein =
    ((calorie - carb * 4) * (proteinRatio / (proteinRatio + fatRatio))) / 4;
  const fat =
    ((calorie - carb * 4) * (fatRatio / (proteinRatio + fatRatio))) / 9;
  return {
    calorie: String(Math.round(calorie)),
    carb: String(Math.round(carb)),
    protein: String(Math.round(protein)),
    fat: String(Math.round(fat)),
  };
};
const convertByProtein = (targetCalorie: string, proteinForMod: string) => {
  const calorie = parseFloat(targetCalorie);
  const protein = parseFloat(proteinForMod);
  const carbRatio = parseFloat(ratioCdToValue.SP005001.carbRatio);
  const fatRatio = parseFloat(ratioCdToValue.SP005001.proteinRatio);
  const carb =
    ((calorie - protein * 4) * (carbRatio / (carbRatio + fatRatio))) / 4;
  const fat =
    ((calorie - protein * 4) * (fatRatio / (carbRatio + fatRatio))) / 4;
  return {
    calorie: String(Math.round(calorie)),
    carb: String(Math.round(carb)),
    protein: String(Math.round(protein)),
    fat: String(Math.round(fat)),
  };
};
const convertByFat = (targetCalorie: string, fatForMod: string) => {
  const calorie = parseFloat(targetCalorie);
  const fat = parseFloat(fatForMod);
  const proteinRatio = parseFloat(ratioCdToValue.SP005001.proteinRatio);
  const carbRatio = parseFloat(ratioCdToValue.SP005001.carbRatio);
  const protein =
    ((calorie - fat * 9) * (proteinRatio / (proteinRatio + carbRatio))) / 4;
  const carb =
    ((calorie - fat * 9) * (carbRatio / (proteinRatio + carbRatio))) / 4;
  return {
    calorie: String(Math.round(calorie)),
    carb: String(Math.round(carb)),
    protein: String(Math.round(protein)),
    fat: String(Math.round(fat)),
  };
};

export const convertNutr: {
  [key: string]: (
    targetCalorie: string,
    input: string,
  ) => {calorie: string; carb: string; protein: string; fat: string};
} = {
  calorieChange: (targetCalorie, nutr) => convertByCalorie(targetCalorie, nutr),
  carbChange: (targetCalorie, nutr) => convertByCarb(targetCalorie, nutr),
  proteinChange: (targetCalorie, nutr) => convertByProtein(targetCalorie, nutr),
  fatChange: (targetCalorie, nutr) => convertByFat(targetCalorie, nutr),
};

export const convertNutrByWeight = (
  weight: string,
  baseLine: IBaseLineData,
): {calorie: string; carb: string; protein: string; fat: string} => {
  const bmr = calculateBMR(
    baseLine.gender,
    baseLine.age,
    baseLine.height,
    weight,
  );
  const {tmr, calorie, carb, protein, fat} = calculateNutrTarget(
    weight,
    3,
    2.3,
    45,
    baseLine.dietPurposeCd,
    bmr,
  );
  return {calorie, carb, protein, fat};
};
