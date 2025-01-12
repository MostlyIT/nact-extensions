import { Dispatchable } from "@nact/core";
import { Set } from "immutable";
import { SnapshotMessage } from "../../messages/SnapshotMessage";

export type PublisherOptions<TSnapshot> = {
  readonly initialSubscribersSet?: Set<
    Dispatchable<SnapshotMessage<TSnapshot>>
  >;
};
