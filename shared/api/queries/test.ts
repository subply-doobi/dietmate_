import {useQuery} from '@tanstack/react-query';
import {AxiosError, InternalAxiosRequestConfig} from 'axios';

function createAxiosError(status: number, message: string): AxiosError {
  const error = new Error(message) as AxiosError;
  error.isAxiosError = true;
  error.response = {
    data: {},
    status: status,
    statusText: message,
    headers: {},
    config: {} as InternalAxiosRequestConfig<any>,
  };

  return error;
}

export const useTestQuery = () => {
  return useQuery<String>({
    queryKey: ['test'],
    queryFn: async () => {
      throw createAxiosError(401, 'test error');
    },
    enabled: false,
  });
};
