import {
  dispatch,
  Dispatchable,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { Set } from "immutable";
import { PublisherState } from "./PublisherState";
import { PublishSnapshotMessage } from "./PublishMessage";
import { SnapshotMessage } from "./SnapshotMessage";
import { SubscribeMessage } from "./SubscribeMessage";
import { UnsubscribeMessage } from "./UnsubscribeMessage";

export const spawnPublisher = <TSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>
) =>
  spawn(
    parent,
    (
      state: PublisherState<TSnapshot>,
      message:
        | PublishSnapshotMessage<TSnapshot>
        | SubscribeMessage<TSnapshot>
        | UnsubscribeMessage<TSnapshot>
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
  );
