import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAX_NUM_OF_RECENT_PRODUCT, AM_DEFAULT_SETTINGS } from "../constants";

// Centralized AsyncStorage keys for readability and safety
export const AS_KEYS = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "REFRESH_TOKEN",
  NOT_SHOW_AGAIN: "NOT_SHOW_AGAIN",
  CHECKLIST: "CHECKLIST",
  RECENT_PRODUCTS: "RECENT_PRODUCTS",
  AUTO_MENU_SETTINGS: "AUTO_MENU_SETTINGS",
} as const;
export type AsyncStorageKey = (typeof AS_KEYS)[keyof typeof AS_KEYS];

// Tokens ------------------------ //
export const storeToken = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem(AS_KEYS.ACCESS_TOKEN, accessToken);
  await AsyncStorage.setItem(AS_KEYS.REFRESH_TOKEN, refreshToken);
};

export const getStoredToken = async () => {
  const accessToken = await AsyncStorage.getItem(AS_KEYS.ACCESS_TOKEN);
  const refreshToken = await AsyncStorage.getItem(AS_KEYS.REFRESH_TOKEN);
  return { accessToken, refreshToken };
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(AS_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(AS_KEYS.REFRESH_TOKEN);
    console.log("removeToken: ", "success");
  } catch (e) {
    console.log("wipeDoobiTokenFail: ", e);
  }
};

// Not show again ------------------------ //
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
      AS_KEYS.NOT_SHOW_AGAIN,
      JSON.stringify(notShowAgainInitial)
    );
  } catch (e) {
    console.log(e);
  }
};
export const getNotShowAgainList = async (): Promise<INotShowAgainInitial> => {
  try {
    const notShowAgainList = await AsyncStorage.getItem(AS_KEYS.NOT_SHOW_AGAIN);
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
    const notShowAgainList = await AsyncStorage.getItem(
      AS_KEYS.NOT_SHOW_AGAIN
    ).then((v) => (v ? JSON.parse(v) : notShowAgainInitial));
    notShowAgainList[key] = value;
    await AsyncStorage.setItem(
      AS_KEYS.NOT_SHOW_AGAIN,
      JSON.stringify(notShowAgainList)
    );
  } catch (error) {
    console.error(error);
  }
};

// Checklist ------------------------ //
interface IChecklist {
  [key: string]: string[]; // {orderNo: menuNo/QtyIdx []}
}
export const getTotalChecklist = async () => {
  try {
    const checklist = await AsyncStorage.getItem(AS_KEYS.CHECKLIST);
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
    await AsyncStorage.setItem(AS_KEYS.CHECKLIST, JSON.stringify(checklist));
  } catch (e) {
    console.log("AsyncStorage: updateTotalCheckList 오류");
  }
};

export const clearChecklist = async () => {
  try {
    await AsyncStorage.removeItem(AS_KEYS.CHECKLIST);
  } catch (e) {
    console.log("AsyncStorage: updateTotalCheckList 오류");
  }
};

// Recent products ------------------------ //
export const addToRecentProduct = async (productNo: string) => {
  try {
    const json = await AsyncStorage.getItem(AS_KEYS.RECENT_PRODUCTS);
    let products: string[] = json ? JSON.parse(json) : [];

    const isProductExists = products.some((p) => p === productNo);

    if (isProductExists) {
      products = products.filter((p) => p !== productNo);
    }

    products.unshift(productNo);

    if (products.length > MAX_NUM_OF_RECENT_PRODUCT)
      products = products.slice(0, MAX_NUM_OF_RECENT_PRODUCT);
    await AsyncStorage.setItem(
      AS_KEYS.RECENT_PRODUCTS,
      JSON.stringify(products)
    );
  } catch (e) {
    console.error("Failed to store recent product", e);
  }
};

export const getRecentProducts = async (): Promise<string[]> => {
  try {
    const json = await AsyncStorage.getItem(AS_KEYS.RECENT_PRODUCTS);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error("Failed to read recent products", e);
    return [];
  }
};

// AutoMenu settings ------------------------ //
export type AutoMenuSettings = {
  selectedCategory: boolean[];
  wantedCompany: string;
  priceSliderValue: number[];
};

export const saveAutoMenuSettings = async (data: Partial<AutoMenuSettings>) => {
  try {
    const prev = await AsyncStorage.getItem(AS_KEYS.AUTO_MENU_SETTINGS);
    const prevData: Partial<AutoMenuSettings> = prev ? JSON.parse(prev) : {};
    const newData: Partial<AutoMenuSettings> = { ...prevData, ...data };
    await AsyncStorage.setItem(
      AS_KEYS.AUTO_MENU_SETTINGS,
      JSON.stringify(newData)
    );
    return true;
  } catch (e) {
    console.error("Failed to save autoMenu data:", e);
    return false;
  }
};

export const getAutoMenuSettings = async (): Promise<AutoMenuSettings> => {
  // Default settings from constants
  const defaults: AutoMenuSettings = {
    selectedCategory: AM_DEFAULT_SETTINGS.selectedCategory,
    wantedCompany: AM_DEFAULT_SETTINGS.wantedCompany,
    priceSliderValue: AM_DEFAULT_SETTINGS.priceSliderValue,
  };

  try {
    const value = await AsyncStorage.getItem(AS_KEYS.AUTO_MENU_SETTINGS);
    if (value) {
      // Merge with defaults to ensure all fields are present
      return { ...defaults, ...JSON.parse(value) };
    }
    return defaults;
  } catch (e) {
    console.error("Failed to load autoMenu data:", e);
    return defaults;
  }
};

export const removeAutoMenuSettings = async () => {
  try {
    await AsyncStorage.removeItem(AS_KEYS.AUTO_MENU_SETTINGS);
    return true;
  } catch (e) {
    console.error("Failed to remove autoMenu data:", e);
    return false;
  }
};
