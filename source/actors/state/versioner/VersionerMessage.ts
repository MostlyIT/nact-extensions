import { SetDestinationMessage } from "../../../data-types/messages/SetDestinationMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../../data-types/messages/UnsetDestinationMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";

export type VersionerMessage<
  TValue,
  TInputVersion extends Version<any>,
  TSemanticSymbol extends symbol
> =
  | SetDestinationMessage<
      StateSnapshot<
        TValue,
        TInputVersion & {
          readonly [key in TSemanticSymbol]: number;
        },
        TSemanticSymbol
      >
    >
  | SnapshotMessage<StateSnapshot<TValue, TInputVersion, symbol | undefined>>
  | UnsetDestinationMessage;
