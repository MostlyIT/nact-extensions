import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "../../messages/SnapshotMessage";

type MapperStateWithDestination<TOutputSnapshot> = {
  readonly destination: Dispatchable<SnapshotMessage<TOutputSnapshot>>;
  readonly isDestinationSet: true;
};

type MapperStateWithoutDestination = {
  readonly isDestinationSet: false;
};

export type MapperState<TOutputSnapshot> =
  | MapperStateWithDestination<TOutputSnapshot>
  | MapperStateWithoutDestination;
