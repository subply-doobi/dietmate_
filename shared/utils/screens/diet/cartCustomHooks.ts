import {useEffect, useReducer, Reducer, useCallback} from 'react';

// Define the different actions our reducer can handle
const ACTIONS = {
  INIT: 'INIT',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

type State<T> = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: T | null;
};

type Action<T> =
  | {type: typeof ACTIONS.INIT}
  | {type: typeof ACTIONS.SUCCESS; payload: T}
  | {type: typeof ACTIONS.ERROR};

// Define our reducer function
const reducer: Reducer<State<any>, Action<any>> = (state, action) => {
  switch (action.type) {
    case ACTIONS.INIT:
      return {...state, isLoading: true, isError: false};
    case ACTIONS.SUCCESS:
      return {
        ...state,
        isLoading: false,
        isSuccess: true,
        data: action.payload,
      };
    case ACTIONS.ERROR:
      return {...state, isLoading: false, isError: true};
    default:
      throw new Error();
  }
};

export const useAsync = <T>({
  asyncFunction,
  autoRun = false,
  deps = [],
}: {
  asyncFunction: () => Promise<T>;
  autoRun?: false;
  deps?: any[];
}) => {
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(reducer, {
    isLoading: false,
    isSuccess: false,
    isError: false,
    data: null,
  });

  const execute = useCallback(async () => {
    dispatch({type: ACTIONS.INIT});
    try {
      setTimeout(async () => {
        const data = await asyncFunction();
        dispatch({type: ACTIONS.SUCCESS, payload: data});
      }, 1200);
    } catch (error) {
      dispatch({type: ACTIONS.ERROR});
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (!autoRun) return;
    execute();
  }, [deps]);

  return {...state, execute};
};
