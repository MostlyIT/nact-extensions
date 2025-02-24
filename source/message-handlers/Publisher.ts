import { SnapshotMessage } from "../data-types/messages/SnapshotMessage";
import { SubscriptionMessage } from "../data-types/messages/SubscriptionMessage";
import { dispatch, Dispatchable } from "../vendored/@nact/core";
import { MessageHandler } from "./MessageHandler";

export type Publisher<TSnapshot> = MessageHandler<
  SubscriptionMessage<TSnapshot> | SnapshotMessage<TSnapshot>
>;

export type PublisherOptions<TSnapshot> = {
  initialSubscribers: Dispatchable<SnapshotMessage<TSnapshot>>[];
};

type PublisherState<TSnapshot> = {
  subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>;
};

export function Publisher<TSnapshot>(
  options?: PublisherOptions<TSnapshot>
): Publisher<TSnapshot> {
  const state: PublisherState<TSnapshot> = {
    subscribers: new Set(options?.initialSubscribers ?? []),
  };

  return (message) => {
    switch (message.type) {
      case "snapshot":
        const snapshotMessage: SnapshotMessage<TSnapshot> = {
          type: "snapshot",
          snapshot: message.snapshot,
        };

        for (const subscriber of state.subscribers) {
          dispatch(subscriber, snapshotMessage);
        }

        break;
      case "subscribe":
        state.subscribers.add(message.subscriber);
        break;
      case "unsubscribe":
        state.subscribers.delete(message.subscriber);
        break;
    }
  };
}
