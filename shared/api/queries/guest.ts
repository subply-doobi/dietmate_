import { useQuery } from "@tanstack/react-query";
import { IGetGuestYnData } from "../types/guest";
import { GET_GUEST_YN } from "../urls";
import axios from "axios";

const queryFnGetGuestYn = async () => {
  const requestConfig = {
    timeout: Number(process.env.EXPO_PUBLIC_AXIOS_TIMEOUT),
  };
  const res = await axios.get(GET_GUEST_YN, requestConfig);
  return res.data;
};

export const useGetGuestYn = () => {
  return useQuery<IGetGuestYnData>({
    queryKey: [GET_GUEST_YN],
    queryFn: () => queryFnGetGuestYn(),
    retry: 1,
  });
};
