import { IBaseLineData } from "../../../api/types/baseLine";
import { Router } from "expo-router";

export const navigateByUserInfo = async (
  data: IBaseLineData | any,
  router: Router
) => {
  const hasBaseLine = Object.keys(data).length === 0 ? false : true;
  if (!hasBaseLine) {
    // baseline 없으면 UserInput으로
    // navigation.navigate('UserInput');
    router.push("/UserInput");
    return;
  }
  // baseline 있으면 홈으로
  router.replace("/(tabs)");
  // navigation.reset({
  //   index: 0,
  //   routes: [{name: 'BottomTabNav', params: {screen: 'NewHome'}}],
  // });
};
