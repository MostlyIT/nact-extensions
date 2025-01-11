import {
  dispatch,
  Dispatchable,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { Set } from "immutable";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { Publisher } from "./Publisher";
import { PublisherMessage } from "./PublisherMessage";
import { PublisherState } from "./PublisherState";

export const spawnPublisher = <TSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  options?: {
    readonly initialSubscribersSet?: Set<
      Dispatchable<SnapshotMessage<TSnapshot>>
    >;
  }
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
