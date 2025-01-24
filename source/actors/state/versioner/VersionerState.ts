import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { Relay } from "../../relay/Relay";

export type VersionerState<
  TValue,
  TInputVersion extends Version<any>,
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
