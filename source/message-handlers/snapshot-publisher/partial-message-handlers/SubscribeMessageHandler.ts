import { MessageHandler } from "../../../interfaces/MessageHandler";
import { SnapshotPublisherState } from "../SnapshotPublisherState";
import {
  isSubscribeMessage__unsafe,
  SubscribeMessage,
} from "../messages/SubscribeMessage";

export type SubscribeMessageHandler<TSnapshot> = MessageHandler<
  SubscribeMessage<TSnapshot>,
  SnapshotPublisherState<TSnapshot>
>;

export const createSubscribeMessageHandler = <
  TSnapshot
>(): SubscribeMessageHandler<TSnapshot> => ({
  handleMessage: (state, message) => {
    return {
      subscribers: state.subscribers.add(message.subscriber),
    };
  },
  messageTypeGuard: isSubscribeMessage__unsafe,
});
