import { Dimensions, Platform } from "react-native";
import { ISortFilter } from "../features/reduxSlices/sortFilterSlice";
import Constants from "expo-constants";

// env constants
const extra = Constants.expoConfig?.extra;
// sensitive
const API_KEY_IAMPORT = extra?.API_KEY_IAMPORT ?? "";
const API_SECRET_IAMPORT = extra?.API_SECRET_IAMPORT ?? "";
const CHANNEL_KEY_KAKAOPAY = extra?.CHANNEL_KEY_KAKAOPAY ?? "";
const CHANNEL_KEY_SMARTRO_V2 = extra?.CHANNEL_KEY_SMARTRO_V2 ?? "";
// public
const APP_VARIANT = extra?.APP_VARIANT ?? "development";
const APP_SCHEME_IAMPORT =
  extra?.EXPO_PUBLIC_APP_SCHEME_IAMPORT ?? "dietmate://payV2";
const AXIOS_TIMEOUT = extra?.EXPO_PUBLIC_AXIOS_TIMEOUT ?? 2000;
// const BASE_URL = extra?.EXPO_PUBLIC_BASE_URL ?? "";
const BASE_URL = "http://54.180.29.212:8080"; // 서버 주소 변경되는 경우 종종 있는데 expo에서 업데이트하면 rebuild 필요해서 하드코딩
const REDIRECT_URL_IAMPORT =
  extra?.EXPO_PUBLIC_REDIRECT_URL_IAMPORT ?? "dietmate://payV2";
const STORE_ID_IAMPORT = extra?.EXPO_PUBLIC_STORE_ID_IAMPORT ?? "";
export const ENV = {
  APP_VARIANT,
  API_KEY_IAMPORT,
  API_SECRET_IAMPORT,
  CHANNEL_KEY_KAKAOPAY,
  CHANNEL_KEY_SMARTRO_V2,
  APP_SCHEME_IAMPORT,
  AXIOS_TIMEOUT,
  BASE_URL,
  REDIRECT_URL_IAMPORT,
  STORE_ID_IAMPORT,
};

// RN constants
export const { width, height } = Dimensions.get("screen");
export const SCREENWIDTH = Math.min(width, height);
export const SCREENHEIGHT = Math.max(width, height);
export const DESIGN_WIDTH = 360;
export const DALERT_WIDTH = 280;
export const IS_ANDROID = Platform.OS === "android";
export const IS_IOS = Platform.OS === "ios";
export const NUTRIENT_PROGRESS_HEIGHT = 48;
export const FOOD_LIST_ITEM_HEIGHT = 152;
export const HOME_FILTER_HEADER_HEIGHT = 120;
export const DEFAULT_BOTTOM_TAB_HEIGHT = 83;
export const BOTTOM_INDICATOR_IOS = 16;
export const FORMULA_CAROUSEL_HEIGHT = 390;
export const SORT_FILTER_HEIGHT = 80;
export const MAIN_FOODLIST_HEADER_HEIGHT =
  24 +
  22 +
  2 +
  16 +
  12 +
  4 +
  16 +
  ((SCREENWIDTH - 32 - 16) / 3 - 8) +
  4 +
  16 +
  16 +
  4 +
  SORT_FILTER_HEIGHT;
// HorizontalFoodlist 컴포넌트 height + SortFilter 컴포넌트 height

// service constants
export const MAX_NUM_OF_RECENT_PRODUCT = 10;
export const SERVICE_PRICE_PER_PRODUCT = 300;
export const PRIVACY_POLICY_URL =
  "https://sites.google.com/view/dietmate-pvpolicy/";
export const TERMS_OF_USE_URL =
  "https://sites.google.com/view/dietmate-useterm";
export const INQUIRY_URL = "http://pf.kakao.com/_DvmEG/chat";
export const KOREAN_NUTRITION_REFERENCE_URL =
  "https://www.kns.or.kr/FileRoom/FileRoom_view.asp?idx=108&BoardID=Kdr";
export const PLAY_STORE_URL = "market://details?id=com.subply.dietmate";
export const APP_STORE_URL =
  "itms-apps://itunes.apple.com/us/app//id6472628268";
export const MENU_LABEL = [
  "한 근",
  "두 근",
  "세 근",
  "네 근",
  "다섯 근",
  "여섯 근",
  "일곱 근",
];
export const MENU_NUM_LABEL = [
  "한 근",
  "두 근",
  "세 근",
  "네 근",
  "다섯 근",
  "여섯 근",
  "일곱 근",
  "여덟 근",
  "아홉 근",
  "열 근",
];

// autoMenu constants
export const AM_SELECTED_CATEGORY_IDX = [0, 1, 2, 3, 4, 5];
export const AM_PRICE_TARGET = [6000, 12000];
export const AM_MENU_NUM = 1;
export const AM_INITIAL_STATUS = {
  isLoading: true,
  isSuccess: false,
  isError: false,
};
export const AM_SUCCESS_STATUS = {
  isLoading: false,
  isSuccess: true,
  isError: false,
};
export const AM_ERROR_STATUS = {
  isLoading: false,
  isSuccess: false,
  isError: true,
};

// tutorial sortFilter
export const tutorialSortFilter: ISortFilter = {
  sort: {
    calorie: "",
    carb: "",
    protein: "",
    fat: "",
    price: "",
    priceCalorieCompare: "",
    priceProteinCompare: "",
  },
  filter: {
    category: "",
    selectedBtn: {
      calorie: [],
      carb: [],
      protein: [],
      fat: [],
      price: [],
    },
    nutrition: {
      calorie: [0, 70],
      carb: [0, 20],
      protein: [0, 8],
      fat: [],
    },
    price: [],
    search: "",
  },
  selectedFilter: 0,
};

// Doobi server category etc.
//주간 운동 횟수
export const SPORTS_SEQ_CD = [
  { cdNm: "안함", cd: "SP008001" },
  { cdNm: "1회", cd: "SP008002" },
  { cdNm: "2회", cd: "SP008003" },
  { cdNm: "3회", cd: "SP008004" },
  { cdNm: "4회", cd: "SP008005" },
  { cdNm: "5회", cd: "SP008006" },
  { cdNm: "6회", cd: "SP008007" },
  { cdNm: "7회", cd: "SP008008" },
];

//회당 운동 시간(분)
export const SPORTS_TIME_CD = [
  { cdNm: "30분 이하", cd: "SP009001" },
  { cdNm: "60분 이하", cd: "SP009002" },
  { cdNm: "90분 이하", cd: "SP009003" },
  { cdNm: "120분 이하", cd: "SP009004" },
  { cdNm: "으악그만", cd: "SP009005" },
];

//운동 강도(누가 뭐래도 내 느낌)
export const SPORTS_STRENGTH_CD = [
  { cdNm: "이정도면 잠들기도 가능", cd: "SP010001" },
  { cdNm: "적당한 산책 느낌", cd: "SP010002" },
  { cdNm: "숨이 가쁘지만 버틸 만한 정도", cd: "SP010003" },
  { cdNm: "중간중간 쉬지 않으면 못버틴다", cd: "SP010004" },
  { cdNm: "유언장이 준비되어 있다", cd: "SP010005" },
];

export const DIET_PURPOSE_CD = [
  { cdNm: "다이어트(한 달 1~2kg감량)", cd: "SP002001" },
  { cdNm: "다이어트(한 달 3~4kg감량)", cd: "SP002002" },
  { cdNm: "체중유지", cd: "SP002003" },
  { cdNm: "체중증가(한 달 1~2kg증량) ", cd: "SP002004" },
  { cdNm: "체중증가(한 달 3~4kg증량)", cd: "SP002005" },
];

export const NUTR_RATIO_CD = [
  { cdNm: "55 : 20 : 25(보건복지부 권장)", cd: "SP005001" },
  { cdNm: "20 : 20 : 60(키토 식단)", cd: "SP005002" },
  { cdNm: "40 : 40 : 20(벌크업)", cd: "SP005003" },
];

export const categoryCode: {
  [key: string]: "" | "CG001" | "CG002" | "CG003" | "CG004" | "CG005" | "CG006";
} = {
  전체: "",
  도시락: "CG001",
  닭가슴살: "CG002",
  샐러드: "CG003",
  영양간식: "CG004",
  과자: "CG005",
  음료: "CG006",
};

export const categoryCodeToName: { [key: string]: string } = {
  CG001: "도시락",
  CG002: "닭가슴살",
  CG003: "샐러드",
  CG004: "영양간식",
  CG005: "과자",
  CG006: "음료",
};

interface INutrErrorRange {
  [key: string]: [number, number];
}
export const NUTR_ERROR_RANGE: INutrErrorRange = {
  calorie: [-80, 80],
  carb: [-20, 20],
  protein: [-8, 8],
  fat: [-3, 3],
};

export const SORT_LIST = [
  { id: 0, label: "가격", name: "price" },
  { id: 1, label: "칼로리", name: "calorie" },
  { id: 2, label: "탄수화물", name: "carb" },
  { id: 3, label: "단백질", name: "protein" },
  { id: 4, label: "지방", name: "fat" },
  // { id: 5, label: "가칼비", name: "priceCalorieCompare" },
  // { id: 6, label: "가단비", name: "priceProteinCompare" },
];

export const FILTER_LIST = [
  { id: 0, label: "카테고리", name: "category" },
  { id: 1, label: "영양성분", name: "nutrition" },
  { id: 2, label: "가격", name: "price" },
];
export const FILTER_BTN_RANGE = [
  {
    name: "calorie",
    label: "칼로리",
    unit: "kcal",
    value: [
      [0, 100],
      [100, 200],
      [200, 300],
      [300, 460],
    ],
  },
  {
    name: "carb",
    label: "탄수화물",
    unit: "g",
    value: [
      [0, 20],
      [20, 40],
      [40, 60],
      [60, 80],
    ],
  },
  {
    name: "protein",
    label: "단백질",
    unit: "g",
    value: [
      [0, 10],
      [10, 20],
      [20, 30],
      [30, 42],
    ],
  },
  {
    name: "fat",
    label: "지방",
    unit: "g",
    value: [
      [0, 5],
      [5, 10],
      [10, 15],
      [15, 20],
    ],
  },
  {
    name: "price",
    label: "가격",
    unit: "원",
    value: [
      [0, 1000],
      [1000, 2000],
      [2000, 3000],
      [3000, 4000],
      [4000, 5000],
      [5000, 6000],
      [6000, 7000],
    ],
  },
];
export const ENTRANCE_TYPE = [
  "공동현관 없음(자유출입)",
  "공동현관 비밀번호",
  "기타",
];

interface ITimeToMinutes {
  [key: string]: number;
}
export const timeCdToMinutes: ITimeToMinutes = {
  SP003001: 0,
  SP003002: 30,
  SP003003: 60,
  SP003004: 90,
  SP003005: 120,
  SP004001: 0,
  SP004002: 30,
  SP004003: 60,
  SP004004: 90,
  SP004005: 120,
};
interface IPurposeToCalorie {
  [key: string]: {
    targetText: string;
    additionalCalorieText: string;
    additionalCalorie: string;
  };
}
export const purposeCdToValue: IPurposeToCalorie = {
  SP002001: {
    targetText: "한 달 1~2kg 감량",
    additionalCalorieText: "-500kcal",
    additionalCalorie: "-500",
  },
  SP002002: {
    targetText: "한 달 3~4kg 감량",
    additionalCalorieText: "-700kcal",
    additionalCalorie: "-700",
  },
  SP002003: {
    targetText: "체중 유지",
    additionalCalorieText: "0kcal",
    additionalCalorie: "0",
  },
  SP002004: {
    targetText: "한 달 1~2kg 증량",
    additionalCalorieText: "500kcal",
    additionalCalorie: "500",
  },
  SP002005: {
    targetText: "한 달 3~4kg 증량",
    additionalCalorieText: "700kcal",
    additionalCalorie: "700",
  },
};

interface IRatioCdValue {
  [key: string]: {
    carbRatio: string;
    proteinRatio: string;
    fatRatio: string;
  };
}
export const ratioCdToValue: IRatioCdValue = {
  SP005001: {
    carbRatio: "0.55",
    proteinRatio: "0.2",
    fatRatio: "0.25",
  },
  SP005002: {
    carbRatio: "0.2",
    proteinRatio: "0.2",
    fatRatio: "0.6",
  },
  SP005003: {
    carbRatio: "0.4",
    proteinRatio: "0.4",
    fatRatio: "0.2",
  },
};

// 정규식
// 한글만 포함
export const REGEX_KOR = /^[ㄱ-ㅎ|가-힣]+$/; //문자열에 한글만 있는지 확인
// 핸드폰
export const REGEX_PHONE = /01[016789]-[^0][0-9]{2,3}-[0-9]{3,4}/;
export const REGEX_NUMBER = /^[0-9]*$/;

//사업자 정보 (ex. 대표자, 주소, 사업자 등록번호)
export const BUSINESS_INFO = {
  name: "(주) SUBPLY",
  representative: "신희섭",
  address: "서울 용산구 이촌로 248 38-504",
  businessNumber: "395-81-03151",
  email: "subply.skpk@gmail.com",
  phone: "010-2874-2935",
};
