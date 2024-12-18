import { MessageHandler } from "../../MessageHandler";
import { SnapshotPublisherState } from "../SnapshotPublisherState";
import {
  isUnsubscribeMessage__unsafe,
  UnsubscribeMessage,
} from "../messages/UnsubscribeMessage";

export type UnsubscribeMessageHandler<TSnapshot> = MessageHandler<
  UnsubscribeMessage<TSnapshot>,
  SnapshotPublisherState<TSnapshot>
>;

export const createUnsubscribeMessageHandler = <
  TSnapshot
>(): UnsubscribeMessageHandler<TSnapshot> => ({
  handleMessage: (state, message) => {
    return {
      subscribers: state.subscribers.remove(message.subscriber),
    };
  },
  messageTypeGuard: isUnsubscribeMessage__unsafe,
});
