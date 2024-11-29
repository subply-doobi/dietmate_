import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "@/shared/store/reactQueryStore";
import { mutationFn, queryFn } from "../requestFn";
import { PRODUCTS, PRODUCT, MARK, PRODUCT_DETIAL } from "../keys";
import { IQueryOptions } from "../types/common";

import {
  CREATE_PRODUCT_MARK,
  DELETE_PRODUCT_MARK,
  CREATE_PRODUCT_AUTO,
  LIST_PRODUCT,
  GET_PRODUCT,
  LIST_PRODUCT_MARK,
  LIST_PRODUCT_DETAIL,
} from "../urls";
import {
  IListProductParams,
  IProductData,
  IProductDetailData,
} from "../types/product";
import { SERVICE_PRICE_PER_PRODUCT } from "../../constants";

// PUT //
export const useCreateProductMark = () => {
  const mutation = useMutation({
    mutationFn: (productNo: string) =>
      mutationFn(`${CREATE_PRODUCT_MARK}/${productNo}`, "put"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [MARK] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT] });
    },
  });
  return mutation;
};

// GET //
export const useGetProduct = (
  params: { dietNo: string; productNo: string },
  options?: IQueryOptions
) => {
  const dietNo = params.dietNo;
  const productNo = params.productNo;
  const enabled = options?.enabled ?? true;
  return useQuery<IProductData>({
    queryKey: [PRODUCT],
    queryFn: () => queryFn(`${GET_PRODUCT}/${dietNo}?productNo=${productNo}`),
    enabled,
  });
};

export const useListProduct = (
  params: IListProductParams,
  options?: IQueryOptions
) => {
  const enabled = options?.enabled ?? true;
  const dietNo = params?.dietNo ? params.dietNo : "";

  const {
    sort,
    filter: {
      category,
      nutrition: { calorie, carb, protein, fat },
      price,
      search,
    },
  } = params?.appliedSortFilter;

  const searchParam = search;
  const categoryParam = category;
  const sortKey = Object.keys(sort).find((key) => sort[key] !== "");
  const sortParam = sortKey
    ? `${sortKey.charAt(0).toUpperCase()}${sortKey.slice(1)},${sort[sortKey]}`
    : "";
  const calorieParam =
    calorie.length === 2 ? `Calorie,${calorie[0]},${calorie[1]}|` : "";
  const carbParam = carb.length === 2 ? `Carb,${carb[0]},${carb[1]}|` : "";
  const proteinParam =
    protein.length === 2 ? `Protein,${protein[0]},${protein[1]}|` : "";
  const fatParam = fat.length === 2 ? `Fat,${fat[0]},${fat[1]}|` : "";
  const priceParam =
    price.length === 2
      ? `Price,${price[0] - SERVICE_PRICE_PER_PRODUCT},${
          price[1] - SERVICE_PRICE_PER_PRODUCT
        }|`
      : "";

  return useQuery<IProductData[]>({
    queryKey: [PRODUCTS, dietNo],
    queryFn: () =>
      queryFn(
        `${LIST_PRODUCT}/${dietNo}?searchText=${searchParam}&categoryCd=${categoryParam}&sort=${sortParam}&filter=${calorieParam}${carbParam}${proteinParam}${fatParam}${priceParam}`
      ),
    enabled,
  });
};

export const useListProductDetail = (
  productNo?: string,
  options?: IQueryOptions
) => {
  const enabled = options?.enabled || !!productNo ? true : false;
  return useQuery<IProductDetailData[]>({
    queryKey: [PRODUCT_DETIAL, productNo],
    queryFn: () => queryFn(`${LIST_PRODUCT_DETAIL}/${productNo}`),
    enabled,
  });
};

export const useListProductMark = (options?: IQueryOptions) => {
  const enabled = options?.enabled ?? true;
  return useQuery<IProductData[]>({
    queryKey: [MARK],
    queryFn: () => queryFn(`${LIST_PRODUCT_MARK}`),
    enabled,
  });
};

// DELETE //
export const useDeleteProductMark = () => {
  const mutation = useMutation({
    mutationFn: (productNo: string) =>
      mutationFn(`${DELETE_PRODUCT_MARK}/${productNo}`, "delete"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [MARK] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT] });
    },
  });
  return mutation;
};
