import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { Dispatchable } from "../../vendored/@nact/core";

export type RelayOptions<TSnapshot> = {
  readonly initialDestination?: Dispatchable<SnapshotMessage<TSnapshot>>;
};
