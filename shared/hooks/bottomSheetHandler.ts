import {
  BottomSheetMethods,
  BottomSheetVariables,
} from "@gorhom/bottom-sheet/lib/typescript/types";
import { store } from "../store/reduxStore";
import { setBottomSheetName } from "@/features/reduxSlices/commonSlice";

export const openBS = (
  bsMethod: BottomSheetMethods & BottomSheetVariables,
  bsName: string
) => {
  bsMethod.expand();
  store.dispatch(setBottomSheetName(bsName));
};

export const closeBS = (
  bsMethod: BottomSheetMethods & BottomSheetVariables
) => {
  bsMethod.close();
  setTimeout(() => {
    store.dispatch(setBottomSheetName(""));
  }, 200);
};
