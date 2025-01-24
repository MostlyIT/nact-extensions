export type Version<TKey extends symbol> = {
  readonly [key in TKey]: number;
};

export type KeyOfVersion<TVersion extends Version<any>> =
  TVersion extends Version<infer TKey> ? TKey : never;
