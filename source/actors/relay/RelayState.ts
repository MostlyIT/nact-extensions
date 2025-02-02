import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { Dispatchable } from "../../vendored/@nact/core";

export type RelayState<TSnapshot> =
  | {
      readonly destination: Dispatchable<SnapshotMessage<TSnapshot>>;
      readonly isDestinationSet: true;
    }
  | {
      readonly isDestinationSet: false;
    };
