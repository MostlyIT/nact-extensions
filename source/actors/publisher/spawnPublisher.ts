import { Set } from "immutable";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import {
  dispatch,
  Dispatchable,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "../../vendored/@nact/core";
import { Publisher } from "./Publisher";
import { PublisherMessage } from "./PublisherMessage";
import { PublisherOptions } from "./PublisherOptions";
import { PublisherState } from "./PublisherState";

export const spawnPublisher = <TSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  options?: PublisherOptions<TSnapshot>
): Publisher<TSnapshot> =>
  spawn(
    parent,
    (
      state: PublisherState<TSnapshot>,
      message: PublisherMessage<TSnapshot>
    ): PublisherState<TSnapshot> => {
      switch (message.type) {
        case "snapshot":
          for (const subscriber of state.subscribers) {
            dispatch(subscriber, message);
          }
          return state;
        case "subscribe":
          return {
            subscribers: state.subscribers.add(message.subscriber),
          };
        case "unsubscribe":
          return {
            subscribers: state.subscribers.remove(message.subscriber),
          };
      }
    },
    {
      initialState: {
        subscribers:
          options?.initialSubscribersSet ??
          Set<Dispatchable<SnapshotMessage<TSnapshot>>>(),
      } satisfies PublisherState<TSnapshot>,
    }
  ) as Publisher<TSnapshot>;
