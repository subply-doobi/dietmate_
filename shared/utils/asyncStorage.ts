import AsyncStorage from "@react-native-async-storage/async-storage";
import { IProductData } from "../api/types/product";
import { MAX_NUM_OF_RECENT_PRODUCT } from "../constants";

// asyncStorage ------------------------ //
export const storeToken = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem("ACCESS_TOKEN", accessToken);
  await AsyncStorage.setItem("REFRESH_TOKEN", refreshToken);
};

export const getStoredToken = async () => {
  const accessToken = await AsyncStorage.getItem("ACCESS_TOKEN");
  const refreshToken = await AsyncStorage.getItem("REFRESH_TOKEN");
  return {
    accessToken,
    refreshToken,
  };
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("ACCESS_TOKEN");
    await AsyncStorage.removeItem("REFRESH_TOKEN");
    console.log("removeToken: ", "success");
  } catch (e) {
    console.log("wipeDoobiTokenFail: ", e);
  }
};

interface INotShowAgainInitial {
  homeTooltip: boolean;
  onboarding: boolean;
  tutorial: boolean;
}
const notShowAgainInitial: INotShowAgainInitial = {
  homeTooltip: false,
  onboarding: false,
  tutorial: false,
};
export const initializeNotShowAgainList = async () => {
  try {
    await AsyncStorage.setItem(
      "NOT_SHOW_AGAIN",
      JSON.stringify(notShowAgainInitial)
    );
  } catch (e) {
    console.log(e);
  }
};
export const getNotShowAgainList = async (): Promise<INotShowAgainInitial> => {
  try {
    const notShowAgainList = await AsyncStorage.getItem("NOT_SHOW_AGAIN");
    if (!notShowAgainList) return notShowAgainInitial;
    return JSON.parse(notShowAgainList);
  } catch (error) {
    return notShowAgainInitial;
  }
};

export const updateNotShowAgainList = async ({
  key,
  value,
}: {
  key: keyof INotShowAgainInitial;
  value: boolean;
}) => {
  try {
    const notShowAgainList = await AsyncStorage.getItem("NOT_SHOW_AGAIN").then(
      (v) => (v ? JSON.parse(v) : notShowAgainInitial)
    );
    notShowAgainList[key] = value;
    await AsyncStorage.setItem(
      "NOT_SHOW_AGAIN",
      JSON.stringify(notShowAgainList)
    );
  } catch (error) {
    console.error(error);
  }
};

// checklist
// key -> orderNo
// value -> menuNo/qtyIdx array

interface IChecklist {
  [key: string]: string[];
}
export const getTotalChecklist = async () => {
  try {
    const checklist = await AsyncStorage.getItem("CHECKLIST");
    const parsedChecklist: IChecklist = checklist ? JSON.parse(checklist) : {};
    return parsedChecklist;
  } catch (e) {
    console.log("AsyncStorage: getTotalChecklist 오류");
    return {};
  }
};

export const updateTotalCheckList = async ({
  orderNo,
  menuNoAndQtyIdx,
}: {
  orderNo: string;
  menuNoAndQtyIdx: string;
}) => {
  try {
    let checklist = await getTotalChecklist();
    if (!checklist) return;
    const currentChecklist = checklist[orderNo] || [];

    const updatedChecklist = currentChecklist.includes(menuNoAndQtyIdx)
      ? currentChecklist.filter((v) => v !== menuNoAndQtyIdx)
      : [...currentChecklist, menuNoAndQtyIdx];
    checklist[orderNo] = updatedChecklist;
    await AsyncStorage.setItem("CHECKLIST", JSON.stringify(checklist));
  } catch (e) {
    console.log("AsyncStorage: updateTotalCheckList 오류");
  }
};

export const clearChecklist = async () => {
  try {
    await AsyncStorage.removeItem("CHECKLIST");
  } catch (e) {
    console.log("AsyncStorage: updateTotalCheckList 오류");
  }
};

// Store a product as recently opened
export const addToRecentProduct = async (productNo: string) => {
  try {
    const json = await AsyncStorage.getItem("RECENT_PRODUCTS");
    let products: string[] = json ? JSON.parse(json) : [];

    const isProductExists = products.some((p) => p === productNo);

    if (isProductExists) {
      products = products.filter((p) => p !== productNo);
    }

    // Add to front
    products.unshift(productNo);

    // Limit to maxItems
    if (products.length > MAX_NUM_OF_RECENT_PRODUCT)
      products = products.slice(0, MAX_NUM_OF_RECENT_PRODUCT);
    await AsyncStorage.setItem("RECENT_PRODUCTS", JSON.stringify(products));
  } catch (e) {
    console.error("Failed to store recent product", e);
  }
};

// Read recent products
export const getRecentProducts = async (): Promise<string[]> => {
  try {
    const json = await AsyncStorage.getItem("RECENT_PRODUCTS");
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error("Failed to read recent products", e);
    return [];
  }
};

// automenu settings
export type AutoMenuStorageData = {
  selectedCategory: boolean[];
  wantedCompany: string;
  priceSliderValue: number[];
};
const STORAGE_KEY = "autoMenuSliceData";
export const saveAutoMenuData = async (data: Partial<AutoMenuStorageData>) => {
  try {
    const prev = await AsyncStorage.getItem(STORAGE_KEY);
    const prevData: Partial<AutoMenuStorageData> = prev ? JSON.parse(prev) : {};
    const newData: Partial<AutoMenuStorageData> = { ...prevData, ...data };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return true;
  } catch (e) {
    console.error("Failed to save autoMenu data:", e);
    return false;
  }
};

// Get all data
export const getAutoMenuData = async (): Promise<
  Partial<AutoMenuStorageData>
> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch (e) {
    console.error("Failed to load autoMenu data:", e);
    return {};
  }
};

// Remove all data
export const removeAutoMenuData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Failed to remove autoMenu data:", e);
    return false;
  }
};
