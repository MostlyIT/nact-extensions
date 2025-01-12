import { SetDestinationMessage } from "../../messages/SetDestinationMessage";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../messages/UnsetDestinationMessage";

export type RelayMessage<TSnapshot> =
  | SetDestinationMessage<TSnapshot>
  | SnapshotMessage<TSnapshot>
  | UnsetDestinationMessage;
