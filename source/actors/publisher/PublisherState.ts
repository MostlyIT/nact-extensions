import { Dispatchable } from "@nact/core";
import { Set } from "immutable";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";

export type PublisherState<TSnapshot> = {
  readonly subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>;
};
