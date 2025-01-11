import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "./SnapshotMessage";

export type SubscribeMessage<TSnapshot> = {
  readonly type: "subscribe";
  readonly subscriber: Dispatchable<SnapshotMessage<TSnapshot>>;
};
