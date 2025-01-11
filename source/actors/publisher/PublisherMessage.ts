import {
  PublishSnapshotMessage,
  SubscribeMessage,
  UnsubscribeMessage,
} from "../../messages";

export type PublisherMessage<TSnapshot> =
  | PublishSnapshotMessage<TSnapshot>
  | SubscribeMessage<TSnapshot>
  | UnsubscribeMessage<TSnapshot>;
