import {REGEX_PHONE} from '../constants';

interface IValidateInput {
  [key: string]: (v: string) => {
    isValid: boolean;
    errMsg: string;
  };
}
export const validateInput: IValidateInput = {
  gender: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '성별을 선택해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  age: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '나이를 입력해주세요',
      };
    if (Number(v) < 10 || Number(v) > 100)
      return {
        isValid: false,
        errMsg: '10~100세 안으로 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  height: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '신장을 입력해주세요',
      };
    if (Number(v) < 120 || Number(v) > 230)
      return {
        isValid: false,
        errMsg: '120~230cm 안으로 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  weight: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '몸무게를 입력해주세요',
      };
    if (Number(v) < 30 || Number(v) > 130)
      return {
        isValid: false,
        errMsg: '30~130kg 안으로 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  dietPurposeCd: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '식단의 목적을 선택해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  bmrKnown: (v: string) => {
    if (v === '')
      return {
        isValid: true,
        errMsg: '',
      };
    if (Number(v) < 500 || Number(v) > 2500)
      return {
        isValid: false,
        errMsg: '정확한 기초대사량을 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  amrKnown: (v: string) => {
    if (v === '')
      return {
        isValid: true,
        errMsg: '',
      };
    if (Number(v) < 0 || Number(v) > 2000)
      return {
        isValid: false,
        errMsg: '정확한 운동 칼로리를 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  sportsSeqCd: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '운동 빈도를 선택해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  sportsTimeCd: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '운동 시간을 선택해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  sportsStrengthCd: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '운동 강도를 선택해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  // ThirdInput
  calorie: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 칼로리를 입력해주세요',
      };
    if (Number(v) < 300 || Number(v) > 1400)
      return {
        isValid: false,
        errMsg: '300~1400 kcal 사이로 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  carb: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 탄수화물을 입력해주세요',
      };
    if (Number(v) < 10 || Number(v) > 375)
      return {
        isValid: false,
        errMsg: `한 끼에 ${v}g은 안돼요 ㅠㅠ`,
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  protein: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 단백질을 입력해주세요',
      };
    if (Number(v) < 10 || Number(v) > 200)
      return {
        isValid: false,
        errMsg: `한 끼에 ${v}g은 안돼요 ㅠㅠ`,
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  fat: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 지방을 입력해주세요',
      };
    if (Number(v) < 5 || Number(v) > 100)
      return {
        isValid: false,
        errMsg: `한 끼에 ${v}g은 안돼요 ㅠㅠ`,
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },

  // Mypage calorie, carb, protein, fat change input
  calorieChange: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 칼로리를 입력해주세요',
      };
    if (Number(v) < 300 || Number(v) > 1400)
      return {
        isValid: false,
        errMsg: '300~1400 kcal 사이로 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  carbChange: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 탄수화물을 입력해주세요',
      };
    if (Number(v) < 10 || Number(v) > 375)
      return {
        isValid: false,
        errMsg: `한 끼에 ${v}g은 안돼요 ㅠㅠ`,
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  proteinChange: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 단백질을 입력해주세요',
      };
    if (Number(v) < 10 || Number(v) > 375)
      return {
        isValid: false,
        errMsg: `한 끼에 ${v}g은 안돼요 ㅠㅠ`,
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  fatChange: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '한 끼 목표 지방을 입력해주세요',
      };
    if (Number(v) < 5 || Number(v) > 100)
      return {
        isValid: false,
        errMsg: `한 끼에 ${v}g은 안돼요 ㅠㅠ`,
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  weightChange: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '몸무게를 입력해주세요',
      };
    if (Number(v) < 30 || Number(v) > 130)
      return {
        isValid: false,
        errMsg: '30~130kg 안으로 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },

  // Order input
  buyerName: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '이름을 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  buyerTel: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '휴대폰 번호를 입력해주세요',
      };
    if (!REGEX_PHONE.test(v))
      return {
        isValid: false,
        errMsg: '올바른 휴대폰 번호를 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
  addr2: (v: string) => {
    if (!v)
      return {
        isValid: false,
        errMsg: '상세주소를 입력해주세요',
      };
    return {
      isValid: true,
      errMsg: '',
    };
  },
};
