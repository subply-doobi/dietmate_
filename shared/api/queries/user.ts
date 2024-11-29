import {IQueryOptions} from '../types/common';
import {DELETE_USER, GET_USER} from '../urls';
import {USER} from '../keys';
import {mutationFn, queryFn} from '../requestFn';
import {useMutation, useQuery} from '@tanstack/react-query';
import {IUserData} from '../types/user';

// GET
export const useGetUser = (options?: IQueryOptions) => {
  const enabled = options?.enabled ?? true;
  return useQuery<IUserData>({
    queryKey: [USER],
    queryFn: () => queryFn(GET_USER),
    enabled,
  });
};

// DELETE
export const useDeleteUser = () => {
  const mutation = useMutation({
    mutationFn: () => mutationFn(`${DELETE_USER}`, 'delete'),
  });

  return mutation;
};
