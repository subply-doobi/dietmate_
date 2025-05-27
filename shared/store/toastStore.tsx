import FoodChangeToast from "@/components/toast/FoodChangeToast";
import ProductSelectToast from "@/components/toast/ProductSelectToast";
import QtyChangeToast from "@/components/toast/QtyChangeToast";
import Toast, { ToastConfigParams } from "react-native-toast-message";
import { MenuWithChangeAvailableFoods } from "../utils/screens/lowerShipping/changeAvailable";
import { store } from "./reduxStore";
import {
  onLowerShippingTHide,
  setFoodChangeToast,
  setQtyChangeToast,
} from "@/features/reduxSlices/lowerShippingSlice";
import { IShippingPriceObj, IShippingPriceValues } from "../utils/sumUp";

export const showProductSelectToast = () => {
  Toast.show({
    type: "productSelect",
    position: "bottom",
    autoHide: false,
    swipeable: false,
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
  productSelect: (props: IToastCustomConfigParams) => (
    <ProductSelectToast {...props} />
  ),
  qtyChange: (props: IToastCustomConfigParams) => <QtyChangeToast {...props} />,
  foodChange: (props: IToastCustomConfigParams) => (
    <FoodChangeToast {...props} />
  ),
};
