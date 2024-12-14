import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "./SnapshotMessage";

export type UnsubscribeMessage<TSnapshot> = {
  readonly type: "unsubscribe";
  readonly subscriber: Dispatchable<SnapshotMessage<TSnapshot>>;
};
