export interface IBaseLineData {
  companyCd: string;
  userId: string;
  nickNm: string;
  calorie: string;
  carb: string;
  protein: string;
  fat: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  dietPurposeCd: string;
  sportsSeqCd: string;
  sportsTimeCd: string;
  sportsStrengthCd: string;
}

export interface IBaseLineCreate {
  calorie: string;
  carb: string;
  protein: string;
  fat: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  dietPurposeCd: string;
  sportsSeqCd: string;
  sportsTimeCd: string;
  sportsStrengthCd: string;
}

export interface IBaseLineUpdate {
  calorie?: string;
  carb?: string;
  protein?: string;
  fat?: string;
  gender?: string;
  age?: string;
  height?: string;
  weight?: string;
  dietPurposeCd?: string;
  sportsSeqCd?: string;
  sportsTimeCd?: string;
  sportsStrengthCd?: string;
}
