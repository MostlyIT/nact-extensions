import { SetDestinationMessage } from "../../messages/SetDestinationMessage";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../messages/UnsetDestinationMessage";

export type DistinctMessage<TSnapshot> =
  | SetDestinationMessage<TSnapshot>
  | SnapshotMessage<TSnapshot>
  | UnsetDestinationMessage;
