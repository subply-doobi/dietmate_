import {useQuery} from '@tanstack/react-query';

import {CATEGORY} from '../keys';
import {ICategory, ICategoryCnt} from '../types/category';
import {IQueryOptions} from '../types/common';
import {queryFn} from '../requestFn';

import {LIST_CATEGORY, LIST_CATEGORY_PRODUCT_CNT} from '../urls';

export const useListCategory = (options?: IQueryOptions) => {
  const enabled = options?.enabled ?? true;
  return useQuery<ICategory>({
    queryKey: [CATEGORY],
    queryFn: () => queryFn(LIST_CATEGORY),
    enabled,
    retry: 0,
  });
};
export const useListCategoryCnt = (options?: IQueryOptions) => {
  const enabled = options?.enabled ?? true;
  return useQuery<ICategoryCnt>({
    queryKey: ['count/cateogry'],
    queryFn: () => queryFn(LIST_CATEGORY_PRODUCT_CNT),
    enabled,
    retry: 0,
  });
};
