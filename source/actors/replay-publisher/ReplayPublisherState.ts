import { List } from "immutable";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { Publisher } from "../publisher/Publisher";

export type ReplayPublisherState<TSnapshot> = {
  readonly history: List<SnapshotMessage<TSnapshot>>;
  readonly publisher: Publisher<TSnapshot>;
};
