import { List } from "immutable";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { Publisher } from "../publisher/Publisher";

type ReplayPublisherStateWithPublisher<TSnapshot> = {
  readonly history: List<SnapshotMessage<TSnapshot>>;
  readonly maxHistoryLength: number;
  readonly publisher: Publisher<TSnapshot>;
};

type ReplayPublisherStateWithoutPublisher<TSnapshot> = {
  readonly history: List<SnapshotMessage<TSnapshot>>;
  readonly maxHistoryLength: number;
  readonly publisher: "uninitialized";
};

export type ReplayPublisherState<TSnapshot> =
  | ReplayPublisherStateWithPublisher<TSnapshot>
  | ReplayPublisherStateWithoutPublisher<TSnapshot>;
