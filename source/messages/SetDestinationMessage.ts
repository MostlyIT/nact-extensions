import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "./SnapshotMessage";

export type SetDestinationMessage<TSnapshot> = {
  readonly type: "set destination";
  readonly destination: Dispatchable<SnapshotMessage<TSnapshot>>;
};
