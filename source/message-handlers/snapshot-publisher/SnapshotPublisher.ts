import { combineMessageHandlers } from "../utility/combineMessageHandlers";
import { createPublishSnapshotMessageHandler } from "./partial-message-handlers/PublishSnapshotMessageHandler";
import { createSubscribeMessageHandler } from "./partial-message-handlers/SubscribeMessageHandler";
import { createUnsubscribeMessageHandler } from "./partial-message-handlers/UnsubscribeMessageHandler";

export const createSnapshotPublisher = <TSnapshot>() =>
  combineMessageHandlers({
    publishSnapshot: createPublishSnapshotMessageHandler<TSnapshot>(),
    subscribe: createSubscribeMessageHandler<TSnapshot>(),
    unsubscribe: createUnsubscribeMessageHandler<TSnapshot>(),
  });

export type SnapshotPublisher<TSnapshot> = ReturnType<
  typeof createSnapshotPublisher<TSnapshot>
>;
