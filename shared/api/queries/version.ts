import axios from "axios";
import { GET_VERSION } from "../urls";
import { IQueryOptions } from "../types/common";
import { useQuery } from "@tanstack/react-query";
import { VERSION } from "../keys";
import { ENV } from "@/shared/constants";

const requestConfig = {
  timeout: Number(ENV.AXIOS_TIMEOUT),
};

const queryFn = async () => {
  const res = await axios.get(GET_VERSION, requestConfig);
  const latestVersion = res.data.appVersion.replace(/v/g, "");
  return latestVersion;
};

export const useGetLatestVersion = (options?: IQueryOptions) => {
  const enabled = options?.enabled ?? true;
  return useQuery<string>({
    queryKey: [VERSION],
    queryFn,
    enabled,
  });
};
