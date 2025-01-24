import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Relay } from "../../relay/Relay";

export type VersionerState<
  TValue,
  TInputVersion extends { readonly [key: symbol]: number },
  TSemanticSymbol extends symbol
> = {
  readonly relay: Relay<
    StateSnapshot<
      TValue,
      TInputVersion & {
        readonly [key in TSemanticSymbol]: number;
      },
      TSemanticSymbol
    >
  >;
  readonly previouslyIssuedVersion: number | undefined;
};
