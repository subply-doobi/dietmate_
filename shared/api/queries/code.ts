import {useQuery} from '@tanstack/react-query';
import {queryFn} from '../requestFn';
import {CODE} from '../keys';

import {LIST_CODE} from '../urls';
import {ICodeData} from '../types/code';

// GET //
export const useListCode = (codeNo: string) => {
  return useQuery<ICodeData>({
    queryKey: [`${CODE}/${codeNo}`],
    queryFn: () => queryFn(`${LIST_CODE}/${codeNo}`),
    retry: 1,
  });
};
