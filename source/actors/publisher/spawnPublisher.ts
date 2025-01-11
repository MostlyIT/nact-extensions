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
  parent: LocalActorSystemRef | LocalActorRef<any>
): Publisher<TSnapshot> =>
  spawn(
    parent,
    (
      state: PublisherState<TSnapshot>,
      message: PublisherMessage<TSnapshot>
    ): PublisherState<TSnapshot> => {
      switch (message.type) {
        case "publish snapshot":
          const snapshotMessage: SnapshotMessage<TSnapshot> = {
            type: "snapshot",
            snapshot: message.snapshot,
          };
          for (const subscriber of state.subscribers) {
            dispatch(subscriber, snapshotMessage);
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
        subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>(),
      } satisfies PublisherState<TSnapshot>,
    }
  ) as Publisher<TSnapshot>;
