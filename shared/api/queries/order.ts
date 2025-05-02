import { useMutation, useQuery } from "@tanstack/react-query";

import { ORDER, ORDER_DETAIL, PRODUCTS, DIET_TOTAL_OBJ } from "../keys";
import { queryClient } from "@/shared/store/reactQueryStore";

//기존 testKakaoPay
import { mutationFn, queryFn } from "../requestFn";
import {
  CREATE_ORDER,
  UPDATE_ORDER,
  LIST_ORDER,
  LIST_ORDER_DETAIL,
  DELETE_ORDER,
} from "../urls";
import { IOrderCreate, IOrderData, IOrderDetailData } from "../types/order";
import { IQueryOptions } from "../types/common";

export const useCreateOrder = () => {
  const mutation = useMutation({
    mutationFn: (body: IOrderCreate) =>
      mutationFn(`${CREATE_ORDER}`, "put", body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ORDER] });
      queryClient.invalidateQueries({ queryKey: [DIET_TOTAL_OBJ] });
    },
  });
  return mutation;
};

export const useUpdateOrder = () => {
  const mutation = useMutation({
    mutationFn: ({
      // parameter로 넘길 것
      orderNo,
      statusCd,
    }: {
      orderNo: string;
      statusCd: string;
    }) =>
      mutationFn(
        `${UPDATE_ORDER}?statusCd=${statusCd}&orderNo=${orderNo}`,
        "post"
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ORDER] });
      queryClient.invalidateQueries({ queryKey: [DIET_TOTAL_OBJ] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS] });
    },
  });
  return mutation;
};

export const useListOrder = (options?: IQueryOptions) => {
  const enabled = options?.enabled ?? true;
  return useQuery<IOrderData>({
    queryKey: [ORDER],
    queryFn: () => queryFn(`${LIST_ORDER}`),
    enabled,
  });
};
export const useListOrderDetail = (orderNo: string) => {
  return useQuery<IOrderDetailData>({
    queryKey: [ORDER_DETAIL],
    queryFn: () => queryFn(`${LIST_ORDER_DETAIL}/${orderNo}`),
  });
};

export const useDeleteOrder = () => {
  const mutation = useMutation({
    mutationFn: ({ orderNo }: { orderNo: string }) =>
      mutationFn(`${DELETE_ORDER}/${orderNo}`, "delete"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ORDER] });
    },
  });
  return mutation;
};
