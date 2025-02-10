import axios from "axios";
import { getStoredToken } from "../utils/asyncStorage";
import { IDietDetailAllData, IDietTotalObjData } from "./types/diet";
import { LIST_DIET_DETAIL_ALL } from "./urls";
import { ENV } from "../constants";

export const queryFn = async <T>(
  url: string,
  forReIssue?: boolean
): Promise<T> => {
  const { accessToken, refreshToken } = await getStoredToken();
  const token = forReIssue ? refreshToken : accessToken;
  const requestConfig = {
    headers: { authorization: `Bearer ${token}` },
    timeout: Number(ENV.AXIOS_TIMEOUT),
  };
  const res = await axios.get(url, requestConfig);
  return res.data;
};

export const mutationFn = async <T>(
  url: string,
  method: "put" | "post" | "delete",
  requestBody?: T
) => {
  const { accessToken, refreshToken } = await getStoredToken();
  const requestConfig = {
    url,
    method,
    headers: { authorization: `Bearer ${accessToken}` },
    data: requestBody,
    timeout: Number(ENV.AXIOS_TIMEOUT),
  };
  return axios(requestConfig).then((res) => res.data);
};

export const queryFnDDADataByDietNo = async (): Promise<IDietTotalObjData> => {
  const { accessToken } = await getStoredToken();
  const requestConfig = {
    headers: { authorization: `Bearer ${accessToken}` },
    timeout: Number(ENV.AXIOS_TIMEOUT),
  };
  const res = (
    await axios.get<IDietDetailAllData>(LIST_DIET_DETAIL_ALL, requestConfig)
  ).data;

  const regroupedObj: IDietTotalObjData = {};
  res.forEach((item) => {
    if (!regroupedObj[item.dietNo]) {
      regroupedObj[item.dietNo] = {
        dietNo: "",
        dietSeq: "",
        dietDetail: [],
      };
      regroupedObj[item.dietNo].dietNo = item.dietNo;
      regroupedObj[item.dietNo].dietSeq = item.dietSeq;
      regroupedObj[item.dietNo].dietDetail = !item.productNo ? [] : [item];
    } else {
      regroupedObj[item.dietNo].dietDetail.push(item);
    }
  });

  return regroupedObj;
};
