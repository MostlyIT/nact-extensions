import { Set } from "immutable";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { Dispatchable } from "../../vendored/@nact/core";

export type PublisherOptions<TSnapshot> = {
  readonly initialSubscribersSet?: Set<
    Dispatchable<SnapshotMessage<TSnapshot>>
  >;
};
