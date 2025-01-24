import { SetDestinationMessage } from "../../../data-types/messages/SetDestinationMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../../data-types/messages/UnsetDestinationMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";

export type VersionerMessage<
  TValue,
  TInputVersion extends { readonly [key: symbol]: number },
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
