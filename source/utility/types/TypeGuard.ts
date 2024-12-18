export type TypeGuard<TType> = (candidate: any) => candidate is TType;

export type TypeOfTypeGuard<TTypeGuard extends TypeGuard<any>> =
  TTypeGuard extends TypeGuard<infer TType> ? TType : never;
