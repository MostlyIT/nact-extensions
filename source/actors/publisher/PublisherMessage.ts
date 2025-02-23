import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { SubscriptionMessage } from "../../data-types/messages/SubscriptionMessage";

export type PublisherMessage<TSnapshot> =
  | SnapshotMessage<TSnapshot>
  | SubscriptionMessage<TSnapshot>;
