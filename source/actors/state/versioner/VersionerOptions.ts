import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { RelayOptions } from "../../relay/RelayOptions";

export type VersionerOptions<
  TValue,
  TInputVersion extends Version<any>,
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
