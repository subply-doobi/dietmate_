import colors from "@/shared/colors";
import { ENV } from "@/shared/constants";

// Define the PAY_METHOD object with inferred types
export type IPG = "kakaopay" | "smartro_v2";
export type IPayMethod =
  | "CARD"
  | "VIRTUAL_ACCOUNT"
  | "TRANSFER"
  | "MOBILE"
  | "GIFT_CERTIFICATE"
  | "EASY_PAY";

export const channelKey: {
  [key in IPG]: string;
} = {
  kakaopay: ENV.CHANNEL_KEY_KAKAOPAY as string,
  smartro_v2: ENV.CHANNEL_KEY_SMARTRO_V2 as string,
};

export const PAY_METHOD = [
  {
    value: "EASY_PAY",
    label: "간편결제",
    subBtn: true,
    pg: [
      {
        value: "kakaopay",
        label: "카카오페이",
        logoSource: require("@/shared/assets/otherServiceLogo/kakao_pay.png"),
        logoSize: 40,
        btnActiveBg: colors.kakaoColor,
        textColor: colors.textMain,
      },
      // {
      //   value: 'naverpay',
      //   label: '네이버페이',
      //   iconSource: icons.naverPay,
      //   iconSize: 24,
      //   btnActiveBg: colors.naverColor,
      //   textColor: colors.white,
      // },
    ],
  },
  {
    value: "CARD",
    label: "카드결제",
    subBtn: false,
    pg: [
      {
        value: "smartro_v2",
        label: "스마트로",
        logoSource: null,
        logoSize: 24,
        btnActiveBg: colors.white,
        textColor: colors.textMain,
      },
    ],
  },
  // {
  //   value: 'TRANSFER',
  //   label: '계좌이체',
  //   subBtn: false,
  //   pg: [
  //     {
  //       value: 'smartro_v2',
  //       label: '스마트로',
  //       iconSource: null,
  //       iconSize: 24,
  //       btnActiveBg: colors.white,
  //       textColor: colors.textMain,
  //     },
  //   ],
  // },
  // {
  //   value: 'VIRTUAL_ACCOUNT',
  //   label: '가상계좌',
  //   subBtn: false,
  //   pg: [
  //     {
  //       value: 'smartro_v2',
  //       label: '스마트로',
  //       iconSource: null,
  //       iconSize: 24,
  //       btnActiveBg: colors.white,
  //       textColor: colors.textMain,
  //     },
  //   ],
  // },
] as const;
