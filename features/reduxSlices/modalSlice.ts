import { store } from "@/shared/store/reduxStore";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type IModalName =
  // alert
  // 끼니 추가삭제, 식품 삭제
  | "menuDeleteAlert"
  | "menuDeleteAllAlert"
  | "menuCreateAlert"
  | "menuCreateNAAlert"
  | "productDeleteAlert"

  // 자동구성
  | "autoMenuLoadingAlert"
  | "autoMenuErrorAlert"
  | "autoMenuOverPriceAlert"

  // 튜토리얼
  | "tutorialCompleteAlert"
  | "tutorialFoodLimitAlert"
  | "tutorialRestartAlert"

  // 정보
  | "myBonusGuideAlert"
  | "targetCalorieGuideAlert"

  // 결제
  | "payFailAlert" // 결제 실패
  | "payUrlAlert" // 결제 url 오류 (해당 앱url 실행 불가)

  // 기타
  | "appUpdateAlert" // 앱업데이트
  | "requestErrorAlert" // 요청오류
  | "friendCdAlert" // 친구코드 오류
  | "accountWithdrawalAlert" // 계정삭제
  | "addressDeleteAlert" // 주소삭제
  | "noProductAlert" // 상품없음
  | "changeTargetAlert" // 체크리스트 완료 후 목표 설정
  | "noStockAlert" // 구매직전 재고 없음
  | "orderEmptyAlert" // 주문내역 없음

  // transparentScreen
  | "tutorialTPSStart" // 튜토리얼 시작
  | "tutorialTPSAddMenu"
  | "tutorialTPSAddFood"
  | "tutorialTPSSelectFood"
  | "tutorialTPSAutoRemain"
  | "tutorialTPSChangeFood"
  | "tutorialTPSAutoMenu"

  // bottomSheet
  | "filterBS"
  | "sortBS"
  | "menuNumSelectBS";

export interface IModalValues {
  // alert
  requestErrorAlert: { code?: number | null; msg?: string };
  menuDeleteAlert: { dietNoToDel?: string };
  productDeleteAlert: {
    productNoToDelArr?: string[];
    dietNoToProductDel?: string;
  };
  addressDeleteAlert: { addressNoToDel?: string; nextAddrIdx?: number };
  noProductAlert: { screen?: string };
  payFailAlert: { payFailMsg?: string };
  targetCalorieGuideAlert: { menuPerDay?: number };
  // transparentScreen
  tutorialTPSStart: { tutorialStartCTABtnPy?: number; insetTop?: number };
  // bottomSheet
  menuNumSelectBS: { dietNoToNumControl?: string };
}

export type IModalValue = IModalValues[keyof IModalValues];

export type IModalState = { values: IModalValues } & {
  modalSeq: IModalName[];
} & { isCarouselHided: boolean };

const initialState: IModalState = {
  values: {
    // Alert
    requestErrorAlert: {
      code: null,
      msg: "",
    },
    menuDeleteAlert: {
      dietNoToDel: "",
    },
    productDeleteAlert: {
      productNoToDelArr: [],
      dietNoToProductDel: "",
    },
    addressDeleteAlert: {
      addressNoToDel: "",
      nextAddrIdx: 0,
    },
    noProductAlert: {
      screen: "",
    },
    payFailAlert: {
      payFailMsg: "",
    },
    targetCalorieGuideAlert: {
      menuPerDay: 3,
    },
    // BottomSheet
    menuNumSelectBS: {
      dietNoToNumControl: "",
    },
    // tutorialTPS
    tutorialTPSStart: {
      tutorialStartCTABtnPy: 0,
      insetTop: 0,
    },
  },
  modalSeq: [],
  isCarouselHided: false,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{
        name: IModalName;
        values?: IModalValue;
      }>
    ) => {
      // preventing conflict with reacnimated carousel
      state.isCarouselHided = true;

      // add to modalSeq (open modal)
      if (!state.modalSeq.includes(action.payload.name))
        state.modalSeq.push(action.payload.name);

      if (action.payload.values) {
        const modalNm = action.payload.name as keyof IModalValues;
        state.values[modalNm] = action.payload.values;
      }
    },

    closeModal: (state, action: PayloadAction<{ name: IModalName }>) => {
      // remove from modalSeq
      state.modalSeq = state.modalSeq.filter(
        (modalName) => modalName !== action.payload.name
      );

      // close modal
      const modalNm = action.payload.name as keyof IModalValues;
      state.values[modalNm] = initialState.values[modalNm];

      // preventing conflict with reacnimated carousel
      state.isCarouselHided = false;
    },

    closeAllTutorialModal: (state) => {
      // close all tutorial modal
      state.modalSeq = state.modalSeq.filter(
        (modalName) => !modalName.includes("tutorial")
      );
      state.values = initialState.values;

      // preventing conflict with reacnimated carousel
      state.isCarouselHided = false;
    },
  },
});

export const { openModal, closeModal, closeAllTutorialModal } =
  modalSlice.actions;
export default modalSlice.reducer;
