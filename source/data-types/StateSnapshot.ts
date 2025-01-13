export type StateSnapshot<
  TValue,
  TVersion extends { readonly [key: symbol]: number },
  TSemanticSymbol extends symbol | undefined = undefined
> = {
  readonly semanticSymbol: TSemanticSymbol;
  readonly value: TValue;
  readonly version: TVersion;
};

export type ValueOfStateSnapshot<
  TStateSnapshot extends StateSnapshot<any, any, any>
> = TStateSnapshot extends StateSnapshot<infer TValue, any, any>
  ? TValue
  : never;

export type VersionOfStateSnapshot<
  TStateSnapshot extends StateSnapshot<any, any, any>
> = TStateSnapshot extends StateSnapshot<any, infer TVersion, any>
  ? TVersion
  : never;

export type SemanticSymbolOfStateSnapshot<
  TStateSnapshot extends StateSnapshot<any, any, any>
> = TStateSnapshot extends StateSnapshot<any, any, infer TSemanticSymbol>
  ? TSemanticSymbol
  : never;
