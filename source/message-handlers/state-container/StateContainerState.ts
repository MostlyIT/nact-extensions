import { SnapshotPublisherState } from "../snapshot-publisher/SnapshotPublisherState";

export type StateContainerState<TState, TSnapshot> = {
  readonly state: TState;
  readonly snapshotPublisherState: SnapshotPublisherState<TSnapshot>;
};
