import ProductSelectToast from "@/components/toast/ProductSelectToast";
import Toast from "react-native-toast-message";

export const showProductSelectToast = () => {
  Toast.show({
    type: "productSelect",
    position: "bottom",
    autoHide: false,
    swipeable: false,
  });
};

export const toastConfig = {
  productSelect: () => <ProductSelectToast />,
};
