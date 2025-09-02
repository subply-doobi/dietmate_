import FoodChangeToast from "@/components/toast/FoodChangeToast";
import QtyChangeToast from "@/components/toast/QtyChangeToast";
import Toast, { ToastConfigParams } from "react-native-toast-message";
import { MenuWithChangeAvailableFoods } from "../utils/screens/lowerShipping/changeAvailable";
import { store } from "./reduxStore";
import {
  setFoodChangeToast,
  setQtyChangeToast,
} from "@/features/reduxSlices/lowerShippingSlice";

export const showProductSelectToast = () => {
  Toast.show({
    type: "productSelect",
    position: "bottom",
    autoHide: false,
    swipeable: false,
    bottomOffset: 8,
  });
};

export const showQtyChangeToast = ({ menuIdx }: { menuIdx: number }) => {
  store.dispatch(
    setQtyChangeToast({
      menuIdx,
    })
  );
  Toast.show({
    type: "qtyChange",
    position: "bottom",
    autoHide: false,
    swipeable: false,
    bottomOffset: 8,
  });
};
export const showFoodChangeToast = ({
  menuWithChangeAvailableFoods,
}: {
  menuWithChangeAvailableFoods: MenuWithChangeAvailableFoods;
}) => {
  store.dispatch(
    setFoodChangeToast({
      menuWithChangeAvailableFoods,
    })
  );
  Toast.show({
    type: "foodChange",
    position: "bottom",
    autoHide: false,
    swipeable: false,
    bottomOffset: 8,
  });
};

export type IToastCustomConfigParams = ToastConfigParams<{
  menuIdx?: number;
  menuWithChangeAvailableFoods?: MenuWithChangeAvailableFoods;
}>;
export const toastConfig = {
  qtyChange: (props: IToastCustomConfigParams) => <QtyChangeToast {...props} />,
  foodChange: (props: IToastCustomConfigParams) => (
    <FoodChangeToast {...props} />
  ),
};
