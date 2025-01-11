import { PublishSnapshotMessage } from "../../messages/PublishSnapshotMessage";
import { SubscribeMessage } from "../../messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../messages/UnsubscribeMessage";

export type PublisherMessage<TSnapshot> =
  | PublishSnapshotMessage<TSnapshot>
  | SubscribeMessage<TSnapshot>
  | UnsubscribeMessage<TSnapshot>;
