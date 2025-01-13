import { Dispatchable } from "@nact/core";
import { Set } from "immutable";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";

export type PublisherOptions<TSnapshot> = {
  readonly initialSubscribersSet?: Set<
    Dispatchable<SnapshotMessage<TSnapshot>>
  >;
};
