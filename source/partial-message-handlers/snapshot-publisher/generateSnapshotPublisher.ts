import { dispatch, Dispatchable } from "@nact/core";
import { Set } from "immutable";
import { PartialMessageHandler } from "../../interfaces/PartialMessageHandler";
import { PublishSnapshotMessage } from "./PublishSnapshotMessage";
import { SnapshotMessage } from "./SnapshotMessage";
import { SubscribeMessage } from "./SubscribeMessage";
import { UnsubscribeMessage } from "./UnsubscribeMessage";

export const generateSnapshotPublisher = <
  TSnapshot,
  TThroughMessage
>(): PartialMessageHandler<
  | PublishSnapshotMessage<TSnapshot>
  | SubscribeMessage<TSnapshot>
  | UnsubscribeMessage<TSnapshot>,
  never,
  TThroughMessage,
  {
    readonly subscribers: Set<Dispatchable<SnapshotMessage<TSnapshot>>>;
  }
> => {
  return (state, message) => {
    if (typeof message === "object" && message !== null && "type" in message) {
      if (message.type === "publish snapshot") {
        const snapshotMessage: SnapshotMessage<TSnapshot> = {
          type: "snapshot",
          snapshot: message.snapshot,
        };
        for (const subscriber of state.subscribers) {
          dispatch(subscriber, snapshotMessage);
        }

        return {
          state,
          messages: [],
        };
      }

      if (message.type === "subscribe") {
        return {
          state: {
            subscribers: state.subscribers.add(message.subscriber),
          },
          messages: [],
        };
      }

      if (message.type === "unsubscribe") {
        return {
          state: {
            subscribers: state.subscribers.remove(message.subscriber),
          },
          messages: [],
        };
      }
    }

    // Message was not recognized, so it is passed through.

    return {
      state,
      messages: [message],
    };
  };
};
