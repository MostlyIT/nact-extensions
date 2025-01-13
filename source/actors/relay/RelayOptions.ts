import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";

export type RelayOptions<TSnapshot> = {
  readonly initialDestination?: Dispatchable<SnapshotMessage<TSnapshot>>;
};
