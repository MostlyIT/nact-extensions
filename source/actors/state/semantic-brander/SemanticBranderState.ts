import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { Relay } from "../../relay/Relay";

export type SemanticBranderState<
  TValue,
  TVersion extends Version<any>,
  TSemanticSymbol extends symbol
> = {
  readonly relay: Relay<StateSnapshot<TValue, TVersion, TSemanticSymbol>>;
};
