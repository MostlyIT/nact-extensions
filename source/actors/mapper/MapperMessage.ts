import { SetDestinationMessage } from "../../messages/SetDestinationMessage";
import { SnapshotMessage } from "../../messages/SnapshotMessage";

export type MapperMessage<TInputSnapshot, TOutputSnapshot> =
  | SetDestinationMessage<TOutputSnapshot>
  | SnapshotMessage<TInputSnapshot>;
