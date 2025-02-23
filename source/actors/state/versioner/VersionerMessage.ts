import { DestinationMessage } from "../../../data-types/messages/DestinationMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";

export type VersionerMessage<
  TValue,
  TInputVersion extends Version<any>,
  TSemanticSymbol extends symbol
> =
  | DestinationMessage<
      StateSnapshot<
        TValue,
        Version<KeyOfVersion<TInputVersion> | TSemanticSymbol>,
        TSemanticSymbol
      >
    >
  | SnapshotMessage<
      StateSnapshot<
        TValue,
        Version<KeyOfVersion<TInputVersion>>,
        symbol | undefined
      >
    >;
