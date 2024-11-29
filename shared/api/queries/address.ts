import { useMutation, useQuery } from "@tanstack/react-query";
import { queryFn, mutationFn } from "../requestFn";

import {
  CREATE_ADDRESS,
  UPDATE_ADDRESS,
  LIST_ADDRESS,
  GET_ADDRESS,
  DELETE_ADDRESS,
} from "../urls";
import { IAddressData, IAddressCreate, IAddressUpdate } from "../types/address";
import { queryClient } from "@/shared/store/reactQueryStore";

//PUT
export const useCreateAddress = () => {
  const mutation = useMutation({
    mutationFn: (address: IAddressCreate) =>
      mutationFn(CREATE_ADDRESS, "put", address),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [LIST_ADDRESS] }),
  });
  return mutation;
};

//GET

//
export const useListAddress = () => {
  return useQuery<IAddressData[]>({
    queryKey: [LIST_ADDRESS],
    queryFn: () => queryFn(LIST_ADDRESS),
  });
};

//
export const useGetAddress = () => {
  return useQuery<IAddressData>({
    queryKey: [GET_ADDRESS],
    queryFn: () => queryFn(GET_ADDRESS),
  });
};
//POST
export const useUpdateAddress = () => {
  const mutation = useMutation({
    mutationFn: (requestBody: IAddressUpdate) =>
      mutationFn<IAddressUpdate>(UPDATE_ADDRESS, "post", requestBody),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [LIST_ADDRESS] }),
  });
  return mutation;
};
//DELETE
export const useDeleteAddress = () => {
  const mutation = useMutation({
    mutationFn: (addrNo: string) =>
      mutationFn(`${DELETE_ADDRESS}/${addrNo}`, "delete"),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [LIST_ADDRESS] }),
  });
  return mutation;
};
