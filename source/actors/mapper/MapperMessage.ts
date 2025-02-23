import { DestinationMessage } from "../../data-types/messages/DestinationMessage";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";

export type MapperMessage<TInputSnapshot, TOutputSnapshot> =
  | DestinationMessage<TOutputSnapshot>
  | SnapshotMessage<TInputSnapshot>;
