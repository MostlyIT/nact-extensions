import { List } from "immutable";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { Publisher } from "../publisher/Publisher";

type BaseReplayPublisherState<TSnapshot> = {
  readonly history: List<SnapshotMessage<TSnapshot>>;
};

type ReplayPublisherStateWithPublisher<TSnapshot> =
  BaseReplayPublisherState<TSnapshot> & {
    readonly isPublisherInitialized: true;
    readonly publisher: Publisher<TSnapshot>;
  };

type ReplayPublisherStateWithoutPublisher<TSnapshot> =
  BaseReplayPublisherState<TSnapshot> & {
    readonly isPublisherInitialized: false;
  };

export type ReplayPublisherState<TSnapshot> =
  | ReplayPublisherStateWithPublisher<TSnapshot>
  | ReplayPublisherStateWithoutPublisher<TSnapshot>;
