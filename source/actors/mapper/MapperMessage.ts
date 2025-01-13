import { SetDestinationMessage } from "../../data-types/messages/SetDestinationMessage";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../data-types/messages/UnsetDestinationMessage";

export type MapperMessage<TInputSnapshot, TOutputSnapshot> =
  | SetDestinationMessage<TOutputSnapshot>
  | SnapshotMessage<TInputSnapshot>
  | UnsetDestinationMessage;
