import { Dispatchable } from "../../vendored/@nact/core";
import { SnapshotMessage } from "./SnapshotMessage";

export type SubscriptionMessage<TSnapshot> =
  | {
      readonly type: "subscribe";
      readonly subscriber: Dispatchable<SnapshotMessage<TSnapshot>>;
    }
  | {
      readonly type: "unsubscribe";
      readonly subscriber: Dispatchable<SnapshotMessage<TSnapshot>>;
    };

export type SnapshotOfSubscriptionMessage<TSubscribeMessage> =
  TSubscribeMessage extends SubscriptionMessage<infer TSnapshot>
    ? TSnapshot
    : never;
