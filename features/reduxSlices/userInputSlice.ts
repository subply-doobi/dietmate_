import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DIET_PURPOSE_CD,
  ENTRANCE_TYPE,
  NUTR_RATIO_CD,
  SPORTS_SEQ_CD,
  SPORTS_STRENGTH_CD,
  SPORTS_TIME_CD,
} from "../../shared/constants";
import { IBaseLineData } from "../../shared/api/types/baseLine";
import { IAddressCreate, IAddressData } from "../../shared/api/types/address";
import { formatPhone } from "../../shared/utils/format";
import { validateInput } from "../../shared/utils/validation";
import { IPayMethod, IPG } from "../../shared/utils/screens/order/payConsts";

export interface IUserInputState {
  // UserInput (영양정보계산)
  gender: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  age: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  height: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  weight: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  dietPurposeCd: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  sportsSeqCd: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  sportsTimeCd: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  sportsStrengthCd: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  bmrKnown: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  amrKnown: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  targetOption: {
    value: number[];
    isValid: boolean;
    errMsg: string;
  };
  ratio: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  calorie: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  carb: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  protein: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  fat: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };

  // Mypage calorie, carb, protein, fat change input
  calorieChange: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  carbChange: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  proteinChange: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  fatChange: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  weightChange: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };

  // Order input
  buyerName: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  buyerTel: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  addr1: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  addr2: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  zipCode: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  entranceType: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  entranceNote: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
  pg: {
    value: IPG;
    isValid: boolean;
    errMsg: string;
  };
  paymentMethod: {
    value: IPayMethod;
    isValid: boolean;
    errMsg: string;
  };

  // recommnedCd
  friendCd: {
    value: string;
    isValid: boolean;
    errMsg: string;
  };
}

// 선택사항 input의 경우는 isValid를 true로 설정, errMsg는 빈 문자열로 설정
// validation이 필요한 경우는 validateInput에 추가
export const initialState: IUserInputState = {
  // FirstInput
  gender: {
    value: "M",
    isValid: true,
    errMsg: "",
  },
  age: {
    value: "",
    isValid: false,
    errMsg: "",
  },
  height: {
    value: "",
    isValid: false,
    errMsg: "",
  },
  weight: {
    value: "",
    isValid: false,
    errMsg: "",
  },
  dietPurposeCd: {
    value: DIET_PURPOSE_CD[0].cd,
    isValid: true,
    errMsg: "",
  },
  sportsSeqCd: {
    value: SPORTS_SEQ_CD[0].cd,
    isValid: true,
    errMsg: "",
  },
  sportsTimeCd: {
    value: SPORTS_TIME_CD[0].cd,
    isValid: true,
    errMsg: "",
  },
  sportsStrengthCd: {
    value: SPORTS_STRENGTH_CD[0].cd,
    isValid: true,
    errMsg: "",
  },
  bmrKnown: {
    value: "",
    isValid: true,
    errMsg: "",
  },
  amrKnown: {
    value: "",
    isValid: true,
    errMsg: "",
  },
  targetOption: {
    value: [],
    isValid: true,
    errMsg: "",
  },
  ratio: {
    value: NUTR_RATIO_CD[0].cd,
    isValid: true,
    errMsg: "",
  },
  calorie: {
    value: "",
    isValid: false,
    errMsg: "",
  },
  carb: {
    value: "",
    isValid: false,
    errMsg: "",
  },
  protein: {
    value: "",
    isValid: false,
    errMsg: "",
  },
  fat: {
    value: "",
    isValid: false,
    errMsg: "",
  },

  // Mypage change input
  calorieChange: {
    value: "",
    isValid: false,
    errMsg: "한 끼 목표 칼로리를 입력해주세요",
  },
  carbChange: {
    value: "",
    isValid: false,
    errMsg: "한 끼 목표 탄수화물을 입력해주세요",
  },
  proteinChange: {
    value: "",
    isValid: false,
    errMsg: "한 끼 목표 단백질을 입력해주세요",
  },
  fatChange: {
    value: "",
    isValid: false,
    errMsg: "한 끼 목표 지방을 입력해주세요",
  },
  weightChange: {
    value: "",
    isValid: false,
    errMsg: "몸무게를 입력해주세요",
  },

  // Order input
  buyerName: {
    value: "",
    isValid: false,
    errMsg: "이름을 입력해주세요",
  },
  buyerTel: {
    value: "",
    isValid: false,
    errMsg: "연락처를 입력해주세요",
  },
  addr1: {
    value: "",
    isValid: false,
    errMsg: "주소를 입력해주세요",
  },
  addr2: {
    value: "",
    isValid: false,
    errMsg: "상세주소를 입력해주세요",
  },
  zipCode: {
    value: "",
    isValid: false,
    errMsg: "우편번호를 입력해주세요",
  },
  entranceType: {
    value: ENTRANCE_TYPE[0],
    isValid: true,
    errMsg: "",
  },
  entranceNote: {
    value: "",
    isValid: true,
    errMsg: "",
  },
  pg: {
    value: "kakaopay",
    isValid: true,
    errMsg: "",
  },
  paymentMethod: {
    value: "EASY_PAY",
    isValid: true,
    errMsg: "",
  },

  // recommnedCd
  friendCd: {
    value: "",
    isValid: true,
    errMsg: "",
  },
};

const userInputSlice = createSlice({
  name: "userInput",
  initialState,
  reducers: {
    initializeInput: (state) => {
      Object.assign(state, initialState);
    },
    loadBaseLineData: (state, action: PayloadAction<IBaseLineData>) => {
      // data load
      // FirstInput
      const { gender, age, height, weight, dietPurposeCd } = action.payload;
      state.gender.value = gender;
      state.age.value = age;
      state.height.value = height;
      state.weight.value = weight;
      state.dietPurposeCd.value = dietPurposeCd;
      // SecondInput
      const { sportsSeqCd, sportsTimeCd, sportsStrengthCd } = action.payload;
      state.sportsSeqCd.value = sportsSeqCd;
      state.sportsTimeCd.value = sportsTimeCd;
      state.sportsStrengthCd.value = sportsStrengthCd;
      state.bmrKnown.value = "";
      state.bmrKnown.isValid = true;
      // ThirdInput !!!! thirdInput의 칼탄단지는 baseLine값 불러오는게 아니라 항상 다시 계산하는 값
      state.ratio.value = NUTR_RATIO_CD[0].cd;
      Object.assign(state.calorie, initialState.calorie);
      Object.assign(state.carb, initialState.carb);
      Object.assign(state.protein, initialState.protein);
      Object.assign(state.fat, initialState.fat);
      // Mypage calorie, carb, protein, fat change input -> 마이페이지 변경 칼탄단지, 몸무게는 서버 baseLine 정보 불러오는 값
      const {
        calorie: calChange,
        carb: carbChange,
        protein: proteinChange,
        fat: fatChange,
      } = action.payload;
      state.calorieChange.value = String(parseInt(calChange));
      state.carbChange.value = String(parseInt(carbChange));
      state.proteinChange.value = String(parseInt(proteinChange));
      state.fatChange.value = String(parseInt(fatChange));
      state.weightChange.value = weight;

      // validation
      const loadList: { name: keyof IUserInputState; value: string }[] = [
        { name: "gender", value: gender },
        { name: "age", value: age },
        { name: "height", value: height },
        { name: "weight", value: weight },
        { name: "dietPurposeCd", value: dietPurposeCd },
        { name: "sportsSeqCd", value: sportsSeqCd },
        { name: "sportsTimeCd", value: sportsTimeCd },
        { name: "sportsStrengthCd", value: sportsStrengthCd },
        // {name: 'calorie', value: ''},
        // {name: 'carb', value: ''},
        // {name: 'protein', value: ''},
        // {name: 'fat', value: ''},
        { name: "calorieChange", value: calChange },
        { name: "carbChange", value: carbChange },
        { name: "proteinChange", value: proteinChange },
        { name: "fatChange", value: fatChange },
      ];
      loadList.forEach(({ name, value }) => {
        if (!validateInput[name]) {
          state[name].isValid = true;
          state[name].errMsg = "";
        } else {
          const { errMsg, isValid } = validateInput[name](value);
          state[name].errMsg = errMsg;
          state[name].isValid = isValid;
        }
      });
    },
    loadAddressData: (state, action: PayloadAction<IAddressCreate>) => {
      // data load
      const { addr1, addr2, zipCode } = action.payload;
      state.addr1.value = addr1;
      state.addr2.value = addr2;
      state.zipCode.value = zipCode;

      //validation
      state.addr1.isValid = addr1 ? true : false;
      state.addr1.errMsg = addr1 ? "" : "주소를 입력해주세요";
      const { errMsg, isValid } = validateInput["addr2"](addr2);
      state.addr2.isValid = isValid;
      state.addr2.errMsg = errMsg ? "" : "상세주소를 입력해주세요";
      state.zipCode.isValid = action.payload.zipCode ? true : false;
      state.zipCode.errMsg = action.payload.zipCode
        ? ""
        : "주소를 입력해주세요";
    },
    setValue: (
      state,
      action: PayloadAction<{
        name: keyof IUserInputState;
        value: IUserInputState[keyof IUserInputState]["value"];
      }>
    ) => {
      const name = action.payload.name;
      // targetOption 설정은 validation 필요없음
      if (typeof action.payload.value !== "string" && name === "targetOption") {
        state[name].value = action.payload.value;
        state[name].isValid = true;
        return;
      }
      if (typeof action.payload.value !== "string") return;

      // 핸드폰 번호 input은 입력시 자동으로 하이픈 추가
      const value =
        name === "buyerTel"
          ? formatPhone(action.payload.value)
          : action.payload.value;

      // value update
      state[name].value = value;

      // 운동 "안함" 선택했을 때는 운동시간, 강도도 첫번째 선택지로
      if (name === "sportsSeqCd" && value === SPORTS_SEQ_CD[0].cd) {
        state.sportsTimeCd.value = SPORTS_TIME_CD[0].cd;
        state.sportsStrengthCd.value = SPORTS_STRENGTH_CD[0].cd;
      }

      // validation
      if (!validateInput[name]) {
        state[name].isValid = true;
        state[name].errMsg = "";
        return;
      }
      const { errMsg, isValid } = validateInput[name](value);
      state[name].errMsg = errMsg;
      state[name].isValid = isValid;
    },
    setAddrBase: (
      state,
      action: PayloadAction<{ zipCode: string; addr1: string }>
    ) => {
      const { addr1, zipCode } = action.payload;
      state.addr1.value = addr1;
      state.addr2.value = "";
      state.zipCode.value = zipCode;

      state.addr1.isValid = addr1 ? true : false;
      state.addr2.isValid = false;
      state.zipCode.isValid = zipCode ? true : false;

      state.addr1.errMsg = addr1 ? "" : "주소를 입력해주세요";
      state.addr2.errMsg = "상세주소를 입력해주세요";
      state.zipCode.errMsg = zipCode ? "" : "주소를 입력해주세요";
    },
  },
});

export const {
  setValue,
  loadBaseLineData,
  initializeInput,
  loadAddressData,
  setAddrBase,
} = userInputSlice.actions;

export default userInputSlice.reducer;
