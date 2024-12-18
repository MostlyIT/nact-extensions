import { Dispatchable } from "@nact/core";
import { Set } from "immutable";
import { SnapshotMessage } from "./messages/SnapshotMessage";

export type SnapshotPublisherState<TSnapshot> = {
  readonly subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>;
};
