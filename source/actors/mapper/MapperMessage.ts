import { SetDestinationMessage } from "../../messages/SetDestinationMessage";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../messages/UnsetDestinationMessage";

export type MapperMessage<TInputSnapshot, TOutputSnapshot> =
  | SetDestinationMessage<TOutputSnapshot>
  | SnapshotMessage<TInputSnapshot>
  | UnsetDestinationMessage;
