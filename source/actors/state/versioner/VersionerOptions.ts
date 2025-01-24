import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { RelayOptions } from "../../relay/RelayOptions";

export type VersionerOptions<
  TValue,
  TInputVersion extends { readonly [key: symbol]: number },
  TSemanticSymbol extends symbol
> = RelayOptions<
  StateSnapshot<
    TValue,
    TInputVersion & {
      readonly [key in TSemanticSymbol]: number;
    },
    TSemanticSymbol
  >
>;
