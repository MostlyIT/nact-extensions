import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { SubscribeMessage } from "../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../data-types/messages/UnsubscribeMessage";

export type ReplayPublisherMessage<TSnapshot> =
  | SnapshotMessage<TSnapshot>
  | SubscribeMessage<TSnapshot>
  | UnsubscribeMessage<TSnapshot>;
