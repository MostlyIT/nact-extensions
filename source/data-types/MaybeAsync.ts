export type MaybeAsync<Function extends (...args: any[]) => any> =
  | ((...args: Parameters<Function>) => ReturnType<Function>)
  | ((...args: Parameters<Function>) => Promise<ReturnType<Function>>);
