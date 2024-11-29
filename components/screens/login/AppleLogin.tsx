// App.js

import React from "react";
import { View } from "react-native";
import appleAuth, {
  AppleButton,
} from "@invertase/react-native-apple-authentication";

// doobi util, redux, etc
import { navigateByUserInfo } from "../../../shared/utils/screens/login/navigateByUserInfo";
//react-query
import { useGetBaseLine } from "../../../shared/api/queries/baseLine";
import { useNavigation } from "@react-navigation/native";
import { useLoginByType } from "../../../shared/api/queries/login";
import colors from "../../../shared/colors";

function AppleLogin() {
  // react-query
  const loginByTypeMutation = useLoginByType();
  const { refetch } = useGetBaseLine({ enabled: false });
  const navigation = useNavigation();

  //check apple login & navigate screen
  const signInWithApple = async (): Promise<void> => {
    const GLdata = await loginByTypeMutation.mutateAsync({ type: "guest" });
    if (!GLdata) return;
    const baseLineData = await refetch().then((res) => res.data);
    baseLineData && navigateByUserInfo(baseLineData, navigation);
  };

  //loginScreen에서 apple login 버튼 누르면 실행되는 함수
  async function onAppleButtonPress() {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // Note: it appears putting FULL_NAME first is important, see issue #293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );
    console.log("credentialState", credentialState);
    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      // user is authenticated
      signInWithApple();
    }
  }
  return (
    <View>
      <AppleButton
        style={{
          width: "100%", // You must specify a width
          height: 50, // You must specify a height
          marginTop: 20,
          backgroundColor: colors.backgroundLight2,
        }}
        onPress={() => {
          onAppleButtonPress();
        }}
      />
    </View>
  );
}

export default AppleLogin;
