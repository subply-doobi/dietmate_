import { useMutation } from "@tanstack/react-query";
import { IQueryOptions } from "../types/common";
import { getDoobiToken, getGuestToken } from "./token";
import { storeToken } from "../../utils/asyncStorage";
import { useNavigation } from "@react-navigation/native";
import { login } from "@react-native-kakao/user";

export type ILoginType = "kakao" | "guest";

const loginMutation = async (type: ILoginType) => {
  let accessToken = undefined;
  let refreshToken = undefined;

  // kakaoLogin
  if (type === "kakao") {
    const kakaoToken = await login();
    console.log("login.ts: LoginMutation: kakaoToken: ", kakaoToken);
    const kakaoAccessToken = kakaoToken?.accessToken;
    const res = await getDoobiToken(kakaoAccessToken);
    accessToken = res?.accessToken || undefined;
    refreshToken = res?.refreshToken || undefined;
  }

  // guestLogin
  if (type === "guest") {
    const res = await getGuestToken();
    accessToken = res?.accessToken || undefined;
    refreshToken = res?.refreshToken || undefined;
  }

  accessToken && refreshToken && (await storeToken(accessToken, refreshToken));
  return accessToken;
};

export const useLoginByType = (options?: IQueryOptions) => {
  const navigation = useNavigation();
  const mutation = useMutation({
    mutationFn: ({ type }: { type: ILoginType }) => loginMutation(type),
    onError: (error: Error) => {
      console.log("useLoginByType error: error.name: ", error.name);
      console.log("useLoginByType error: error.message: ", error.message);
      const isKakaoError = error.message === "user cancelled.";
      if (isKakaoError) return;
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "ErrorPage",
            params: { errorCode: 404, msg: "로그인에 실패했어요" },
          },
        ],
      });
    },
  });
  return mutation;
};
