import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface IModal {
  isOpen: boolean;
  modalId?: string;
  values?: {
    [key: string]: string | number | boolean | null;
  };
}

interface IModals {
  // alert
  appUpdateAlert: IModal;
  requestErrorAlert: IModal & {values?: {code?: number | null; msg: string}};
  menuDeleteAlert: IModal & {values?: {menuNo?: string}};
  menuCreateAlert: IModal;
  menuCreateNAAlert: IModal;
  productDeleteAlert: IModal & {values?: {productNoToDel?: string}};
  accountWithdrawalAlert: IModal;
  addressDeleteAlert: IModal;
  noProductAlert: IModal;
  changeTargetAlert: IModal;
  menuIsCreatingAlert: IModal;
  noStockAlert: IModal;
  myBonusGuideAlert: IModal;
  tutorialRestartAlert: IModal;
  payFailAlert: IModal & {values?: {payFailMsg?: string}};
  orderEmptyAlert: IModal;
  recommendCodeAlert: IModal;
  tutorialFoodLimitAlert: IModal;
  targetCalorieGuideAlert: IModal;
  autoMenuOverPriceAlert: IModal;
  payUrlAlert: IModal;
  // transparentScreen
  tutorialTPS: IModal;
  // bottomSheet
  filterBS: IModal;
  sortBS: IModal;
  menuNumSelectBS: IModal & {values?: {dietNo?: string}};
}
export type IModalState = {modal: IModals} & {modalSeq: string[]};

const initialState: IModalState = {
  modal: {
    // Alert
    appUpdateAlert: {
      isOpen: false,
      modalId: undefined,
    },
    requestErrorAlert: {
      isOpen: false,
      modalId: undefined,
      values: {
        code: null,
        msg: '',
      },
    },
    menuDeleteAlert: {
      isOpen: false,
      modalId: undefined,
      values: {
        menuNo: '',
      },
    },
    menuCreateAlert: {
      isOpen: false,
      modalId: undefined,
    },
    menuCreateNAAlert: {
      isOpen: false,
      modalId: undefined,
    },
    productDeleteAlert: {
      isOpen: false,
      modalId: undefined,
      values: {
        productNoToDel: '',
      },
    },
    accountWithdrawalAlert: {
      isOpen: false,
      modalId: undefined,
    },
    addressDeleteAlert: {
      isOpen: false,
      modalId: undefined,
    },
    noProductAlert: {
      isOpen: false,
      modalId: undefined,
    },
    changeTargetAlert: {
      isOpen: false,
      modalId: undefined,
    },
    menuIsCreatingAlert: {
      isOpen: false,
      modalId: undefined,
    },
    noStockAlert: {
      isOpen: false,
      modalId: undefined,
    },
    myBonusGuideAlert: {
      isOpen: false,
      modalId: undefined,
    },
    tutorialRestartAlert: {
      isOpen: false,
      modalId: undefined,
    },
    payFailAlert: {
      isOpen: false,
      modalId: undefined,
      values: {
        payFailMsg: '',
      },
    },
    orderEmptyAlert: {
      isOpen: false,
      modalId: undefined,
    },
    recommendCodeAlert: {
      isOpen: false,
      modalId: undefined,
    },
    tutorialFoodLimitAlert: {
      isOpen: false,
      modalId: undefined,
    },
    targetCalorieGuideAlert: {
      isOpen: false,
      modalId: undefined,
    },
    autoMenuOverPriceAlert: {
      isOpen: false,
      modalId: undefined,
    },
    payUrlAlert: {
      isOpen: false,
      modalId: undefined,
    },
    // TransparentScreen
    tutorialTPS: {
      isOpen: false,
      modalId: undefined,
    },
    // BottomSheet
    filterBS: {
      isOpen: false,
      modalId: undefined,
    },
    sortBS: {
      isOpen: false,
      modalId: undefined,
    },
    menuNumSelectBS: {
      isOpen: false,
      modalId: undefined,
      values: {
        dietNo: '',
      },
    },
  },
  modalSeq: [],
};

type IModalName = keyof IModals;
type IAlertValue = IModals[keyof IModals]['values'];

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{
        name: IModalName;
        modalId?: string;
        values?: IAlertValue;
      }>,
    ) => {
      // add to modalSeq
      if (!state.modalSeq.includes(action.payload.name))
        state.modalSeq.push(action.payload.name);

      // close every modal except lastModal
      if (state.modalSeq.length > 1) {
        for (let i = 0; i < state.modalSeq.length - 1; i++) {
          const modalName = state.modalSeq[i] as IModalName;
          state.modal[modalName].isOpen = false;
        }
      }

      // open modal
      state.modal[action.payload.name].isOpen = true;
      state.modal[action.payload.name].values = action.payload.values;
      state.modal[action.payload.name].modalId = action.payload.modalId;
    },

    closeModal: (state, action: PayloadAction<{name: IModalName}>) => {
      // remove from modalSeq
      state.modalSeq = state.modalSeq.filter(
        modalName => modalName !== action.payload.name,
      );

      // close modal
      state.modal[action.payload.name].isOpen = false;
      state.modal[action.payload.name].values =
        initialState.modal[action.payload.name].values;
      state.modal[action.payload.name].modalId = undefined;

      // show prev modal if exists
      if (state.modalSeq.length === 0) return;
      const prevModalName = state.modalSeq[
        state.modalSeq.length - 1
      ] as IModalName;
      if (!state.modal[prevModalName].isOpen) {
        state.modal[prevModalName].isOpen = true;
      }
    },
  },
});

export const {openModal, closeModal} = modalSlice.actions;
export default modalSlice.reducer;
