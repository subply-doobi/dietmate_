import AsyncStorage from '@react-native-async-storage/async-storage';

// asyncStorage ------------------------ //
export const storeToken = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem('ACCESS_TOKEN', accessToken);
  await AsyncStorage.setItem('REFRESH_TOKEN', refreshToken);
};

export const getStoredToken = async () => {
  const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
  const refreshToken = await AsyncStorage.getItem('REFRESH_TOKEN');
  return {
    accessToken,
    refreshToken,
  };
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('ACCESS_TOKEN');
    await AsyncStorage.removeItem('REFRESH_TOKEN');
    console.log('removeToken: ', 'success');
  } catch (e) {
    console.log('wipeDoobiTokenFail: ', e);
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
      'NOT_SHOW_AGAIN',
      JSON.stringify(notShowAgainInitial),
    );
  } catch (e) {
    console.log(e);
  }
};
export const getNotShowAgainList = async (): Promise<INotShowAgainInitial> => {
  try {
    const notShowAgainList = await AsyncStorage.getItem('NOT_SHOW_AGAIN');
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
    const notShowAgainList = await AsyncStorage.getItem('NOT_SHOW_AGAIN').then(
      v => (v ? JSON.parse(v) : notShowAgainInitial),
    );
    notShowAgainList[key] = value;
    await AsyncStorage.setItem(
      'NOT_SHOW_AGAIN',
      JSON.stringify(notShowAgainList),
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
    const checklist = await AsyncStorage.getItem('CHECKLIST');
    const parsedChecklist: IChecklist = checklist ? JSON.parse(checklist) : {};
    return parsedChecklist;
  } catch (e) {
    console.log('AsyncStorage: getTotalChecklist 오류');
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
      ? currentChecklist.filter(v => v !== menuNoAndQtyIdx)
      : [...currentChecklist, menuNoAndQtyIdx];
    checklist[orderNo] = updatedChecklist;
    await AsyncStorage.setItem('CHECKLIST', JSON.stringify(checklist));
  } catch (e) {
    console.log('AsyncStorage: updateTotalCheckList 오류');
  }
};

export const clearChecklist = async () => {
  try {
    await AsyncStorage.removeItem('CHECKLIST');
  } catch (e) {
    console.log('AsyncStorage: updateTotalCheckList 오류');
  }
};
