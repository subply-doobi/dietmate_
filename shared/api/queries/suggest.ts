import { useMutation, useQuery } from "@tanstack/react-query";
import { SUGGEST_USER, SUGGEST_USER_EXIST_YN, USER } from "../keys";
import { mutationFn, queryFn } from "../requestFn";
import { IQueryOptions } from "../types/common";
import { ISuggestUserData } from "../types/suggest";
import {
  CREATE_SUGGEST_USER,
  GET_SUGGEST_USER,
  GET_SUGGEST_USER_EXIST_YN,
  UPDATE_SUGGEST_USER,
} from "../urls";
import { queryClient } from "@/shared/store/reactQueryStore";

// PUT
export const useCreateSuggestUser = () => {
  const mutation = useMutation({
    mutationFn: (suggestCd: string) =>
      mutationFn(`${CREATE_SUGGEST_USER}/${suggestCd}`, "put"),
    onSuccess: () => {
      // invalidate
      queryClient.invalidateQueries({ queryKey: [USER] });
    },
  });
  return mutation;
};

// GET
export const useGetSuggestUserExistYn = (
  params: { suggestCd?: string },
  options?: IQueryOptions
) => {
  const suggestCd = params.suggestCd;
  const enabled = options?.enabled ?? true;
  return useQuery<ISuggestUserData>({
    queryKey: [SUGGEST_USER_EXIST_YN],
    queryFn: () => queryFn(`${GET_SUGGEST_USER_EXIST_YN}/${suggestCd}`),
    enabled,
  });
};

export const useGetSuggestUser = (options?: IQueryOptions) => {
  const enabled = options?.enabled ?? true;
  return useQuery<ISuggestUserData>({
    queryKey: [SUGGEST_USER],
    queryFn: () => queryFn(`${GET_SUGGEST_USER}`),
    enabled,
  });
};

// POST
export const useUpdateSuggestUser = () => {
  const mutation = useMutation({
    mutationFn: (suggestCd: string) =>
      mutationFn(`${UPDATE_SUGGEST_USER}/${suggestCd}`, "post"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER] });
    },
  });
  return mutation;
};
