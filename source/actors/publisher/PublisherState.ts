import { Dispatchable } from "@nact/core";
import { Set } from "immutable";
import { SnapshotMessage } from "./SnapshotMessage";

export type PublisherState<TSnapshot> = {
  readonly subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>;
};
