import { Version } from "./Version";

export type StateSnapshot<
  TValue,
  TVersion extends Version<any>,
  TSemanticSymbol extends symbol | undefined = undefined
> = {
  readonly value: TValue;
  readonly version: TVersion;
  readonly semanticSymbol: TSemanticSymbol;
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
