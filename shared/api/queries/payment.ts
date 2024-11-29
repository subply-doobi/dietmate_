import axios from "axios";
import { IQueryOptions } from "../types/common";
import { useQuery } from "@tanstack/react-query";

// Define the fetch function
const fetchPaymentStatus = async (merchant_uid: string) => {
  const getTokenRes = await axios.post<{
    code: number;
    message: string;
    response: { access_token: string; expired_at: number; now: number };
  }>(
    "https://api.iamport.kr/users/getToken",
    {
      imp_key: process.env.EXPO_PUBLIC_API_KEY_IAMPORT,
      imp_secret: process.env.EXPO_PUBLIC_API_SECRET_IAMPORT,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const accessToken = getTokenRes?.data?.response?.access_token;

  const response = await axios.get(
    `https://api.iamport.kr/payments/find/${merchant_uid}`,
    {
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

// Define the custom hook
export const useGetPaymentStatus = (
  options: IQueryOptions & { merchant_uid: string }
) => {
  const enabled = options?.enabled ?? true;
  const merchant_uid = options?.merchant_uid;
  return useQuery({
    queryKey: ["paymentStatus"],
    queryFn: () => fetchPaymentStatus(merchant_uid),
    enabled,
  });
};
