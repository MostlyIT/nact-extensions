import { SnapshotMessage } from "../data-types/messages/SnapshotMessage";
import { SubscriptionMessage } from "../data-types/messages/SubscriptionMessage";
import { dispatch } from "../vendored/@nact/core";
import { MessageHandler } from "./MessageHandler";
import { Publisher, PublisherOptions } from "./Publisher";

export type ReplayPublisher<TSnapshot> = MessageHandler<
  SubscriptionMessage<TSnapshot> | SnapshotMessage<TSnapshot>
>;

export type ReplayPublisherOptions<TSnapshot> = PublisherOptions<TSnapshot>;

type ReplayPublisherState<TSnapshot> = {
  history: SnapshotMessage<TSnapshot>[];
  publisher: Publisher<TSnapshot>;
};

export function ReplayPublisher<TSnapshot>(
  replayCount: number,
  options?: ReplayPublisherOptions<TSnapshot>
): ReplayPublisher<TSnapshot> {
  const state: ReplayPublisherState<TSnapshot> = {
    history: [],
    publisher: Publisher<TSnapshot>(options),
  };

  return (message) => {
    switch (message.type) {
      case "snapshot": {
        const snapshotMessage: SnapshotMessage<TSnapshot> = {
          type: "snapshot",
          snapshot: message.snapshot,
        };

        state.history.push(snapshotMessage);
        if (replayCount < state.history.length) {
          state.history.shift();
        }

        state.publisher(snapshotMessage);
        break;
      }

      case "subscribe": {
        for (const historicalMessage of state.history) {
          dispatch(message.subscriber, historicalMessage);
        }

        state.publisher(message);
        break;
      }

      case "unsubscribe": {
        state.publisher(message);
        break;
      }
    }
  };
}
