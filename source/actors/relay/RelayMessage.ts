import { DestinationMessage } from "../../data-types/messages/DestinationMessage";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";

export type RelayMessage<TSnapshot> =
  | DestinationMessage<TSnapshot>
  | SnapshotMessage<TSnapshot>;
