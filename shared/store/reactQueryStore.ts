import {QueryCache, QueryClient} from '@tanstack/react-query';
import {handleError} from '../../shared/utils/handleError';
import {AxiosError} from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // suspense: true,
      // staleTime: 30000,
      // gcTime: 5 * 60 * 1000,
      retry: 0,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: error => {
        handleError(error);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.log('error', error);
      handleError(error);
    },
  }),
});

// 특정 키에만 따로 설정해보기
// queryClient.setQueryDefaults(todoKeys.all, { staleTime: 1000 * 5 })
