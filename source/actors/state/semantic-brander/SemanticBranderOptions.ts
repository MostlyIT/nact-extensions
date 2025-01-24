import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { RelayOptions } from "../../relay/RelayOptions";

export type SemanticBranderOptions<
  TValue,
  TVersion extends Version<any>,
  TSemanticSymbol extends symbol
> = RelayOptions<StateSnapshot<TValue, TVersion, TSemanticSymbol>>;
