import { Set } from "immutable";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { Dispatchable } from "../../vendored/@nact/core";

export type PublisherState<TSnapshot> = {
  readonly subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>;
};
