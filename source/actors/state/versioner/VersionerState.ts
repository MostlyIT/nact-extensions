import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { Relay } from "../../relay/Relay";

export type VersionerState<
  TValue,
  TInputVersion extends Version<any>,
  TSemanticSymbol extends symbol
> = {
  readonly relay: Relay<
    StateSnapshot<
      TValue,
      Version<KeyOfVersion<TInputVersion> | TSemanticSymbol>,
      TSemanticSymbol
    >
  >;
  readonly previouslyIssuedVersion: number | undefined;
};
