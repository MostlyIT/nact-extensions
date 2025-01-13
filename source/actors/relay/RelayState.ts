import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";

export type RelayState<TSnapshot> =
  | {
      readonly destination: Dispatchable<SnapshotMessage<TSnapshot>>;
      readonly isDestinationSet: true;
    }
  | {
      readonly isDestinationSet: false;
    };
