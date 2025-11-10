import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type IModalName =
  // alert
  | "menuDeleteAllAlert"
  | "autoMenuOverPriceAlert" // 자동구성 예산초과

  // 튜토리얼
  | "tutorialCompleteAlert"
  | "tutorialRestartAlert"

  // 정보
  | "myBonusGuideAlert"
  | "targetCalorieGuideAlert"

  // 결제
  | "payFailAlert" // 결제 실패

  // 기타
  | "appUpdateAlert" // 앱업데이트
  | "requestErrorAlert" // 요청오류
  | "friendCdAlert" // 친구코드 오류
  | "accountWithdrawalAlert" // 계정삭제
  | "addressDeleteAlert" // 주소삭제
  | "changeTargetAlert" // 체크리스트 완료 후 목표 설정
  | "noStockAlert" // 구매직전 재고 없음
  | "orderEmptyAlert" // 주문내역 없음

  // transparentScreen
  | "tutorialTPSStart"; // 튜토리얼 시작

export interface IModalValues {
  // alert
  requestErrorAlert: { code?: number | null; msg?: string };
  addressDeleteAlert: { addressNoToDel?: string; nextAddrIdx?: number };
  payFailAlert: { payFailMsg?: string };
  targetCalorieGuideAlert: { menuPerDay?: number };
  // transparentScreen
  tutorialTPSStart: { tutorialStartCTABtnPy?: number; insetTop?: number };
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
    addressDeleteAlert: {
      addressNoToDel: "",
      nextAddrIdx: 0,
    },
    payFailAlert: {
      payFailMsg: "",
    },
    targetCalorieGuideAlert: {
      menuPerDay: 3,
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
