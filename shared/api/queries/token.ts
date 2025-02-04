import axios, { AxiosError } from "axios";
import { storeToken } from "../../utils/asyncStorage";
import { IReIssueTokenData } from "../types/token";
import { queryFn } from "../requestFn";

import { GET_TOKEN, GET_AUTH, RE_ISSUE_TOKEN, GET_GUEST } from "../urls";
import { ENV } from "@/shared/constants";

const requestConfig = {
  timeout: Number(ENV.AXIOS_TIMEOUT),
};

export const getDoobiToken = async (kakaoAccessToken: string | null) => {
  const result = await axios.get(
    `${GET_TOKEN}/${kakaoAccessToken}`,
    requestConfig
  );
  return result?.status === 200 ? result.data : undefined;
};

export const getGuestToken = async () => {
  const result = await axios.get(`${GET_GUEST}`, requestConfig);
  return result?.status === 200 ? result.data : undefined;
};

export const validateToken = async () => {
  let isValidated = false;
  try {
    // 인증 여부 조회
    await queryFn(GET_AUTH);
    isValidated = true;

    // 인증 오류 처리
  } catch (e) {
    if (!(e instanceof AxiosError)) return { isValidated };
    console.log("validateToken: auth 오류", e.response?.status);

    // 토큰 재발급 (401에러인 경우만 재발급 시도)
    if (e.response?.status !== 401) return { isValidated };
    try {
      const reIssue = await queryFn<IReIssueTokenData>(RE_ISSUE_TOKEN, true);
      await storeToken(reIssue.accessToken, reIssue.refreshToken);
      isValidated = true;
      console.log(
        "----------------------  !! reIssue !! --------------------------"
      );

      // 토큰 재발급 오류
    } catch (e) {
      if (!(e instanceof AxiosError)) return { isValidated };
      console.log("validateToken: reIssue 오류: ", e.response?.status);
    }
  }
  console.log("validateToken: isValidated: ", isValidated);
  return { isValidated };
};
