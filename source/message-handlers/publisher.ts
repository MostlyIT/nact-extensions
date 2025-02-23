import { Set } from "immutable";
import { SnapshotMessage } from "../data-types/messages/SnapshotMessage";
import { SubscriptionMessage } from "../data-types/messages/SubscriptionMessage";
import { Dispatchable } from "../vendored/@nact/core";

// Options

type PublisherOptions<TSnapshot> = {
  readonly initialSubscribers?: Iterable<
    Dispatchable<SnapshotMessage<TSnapshot>>
  >;
};

// State

type PublisherState<TSnapshot> = {
  readonly subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>;
};

type WithPublisherState<TSnapshot> = {
  readonly publisherState: PublisherState<TSnapshot>;
};

export const addInitialPublisherState = <TSnapshot>(
  options?: PublisherOptions<TSnapshot>
) => ({
  to: <TInputState extends object>(
    inputState: TInputState
  ): TInputState & WithPublisherState<TSnapshot> => ({
    ...inputState,
    publisherState: {
      subscribers: Set(options?.initialSubscribers ?? []),
    },
  }),
});

// Message Processing

type PublisherMessage<TSnapshot> = SubscriptionMessage<TSnapshot>;

export const processPublisherMessage = <
  TSnapshot,
  TState extends WithPublisherState<TSnapshot>
>(
  state: TState,
  message: PublisherMessage<TSnapshot>
): TState => {
  switch (message.type) {
    case "subscribe":
      return {
        ...state,
        publisherState: {
          subscribers: state.publisherState.subscribers.add(message.subscriber),
        },
      };
    case "unsubscribe":
      return {
        ...state,
        publisherState: {
          subscribers: state.publisherState.subscribers.remove(
            message.subscriber
          ),
        },
      };
  }
};
