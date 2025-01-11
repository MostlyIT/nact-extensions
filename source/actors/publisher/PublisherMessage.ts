import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { SubscribeMessage } from "../../messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../messages/UnsubscribeMessage";

export type PublisherMessage<TSnapshot> =
  | SnapshotMessage<TSnapshot>
  | SubscribeMessage<TSnapshot>
  | UnsubscribeMessage<TSnapshot>;
