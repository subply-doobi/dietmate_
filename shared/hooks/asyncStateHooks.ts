import { useCallback, useEffect, useRef, useState } from "react";

type UseAsyncResult<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: any;
  execute: (...args: any[]) => Promise<T | void>;
  reset: () => void;
};

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  delay?: number
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<any>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args: any[]) => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      setError(null);
      if (delay) {
        await new Promise((res) => setTimeout(res, delay));
      }
      try {
        const result = await asyncFunction(...args);
        if (mountedRef.current) {
          setData(result);
          setIsSuccess(true);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setIsError(true);
          setError(err);
        }
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [asyncFunction, delay]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setIsError(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  // Clean up on unmount
  // (prevents setting state on unmounted component)
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { data, isLoading, isError, isSuccess, error, execute, reset };
}
