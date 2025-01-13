import { SetDestinationMessage } from "../../data-types/messages/SetDestinationMessage";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../data-types/messages/UnsetDestinationMessage";

export type RelayMessage<TSnapshot> =
  | SetDestinationMessage<TSnapshot>
  | SnapshotMessage<TSnapshot>
  | UnsetDestinationMessage;
