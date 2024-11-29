export interface IQueryOptions<T = void> {
  enabled?: boolean;
  initialData?: T;
  additionalQuerykey?: Array<string | number>;
}

export interface IMutationOptions {
  onSuccess?: Function;
}
