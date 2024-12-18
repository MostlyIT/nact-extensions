import { dispatch } from "@nact/core";
import { MessageHandler } from "../../../interfaces/MessageHandler";
import {
  isPublishSnapshotMessage__unsafe,
  PublishSnapshotMessage,
} from "../messages/PublishSnapshotMessage";
import { SnapshotMessage } from "../messages/SnapshotMessage";
import { SnapshotPublisherState } from "../SnapshotPublisherState";

export type PublishSnapshotMessageHandler<TSnapshot> = MessageHandler<
  PublishSnapshotMessage<TSnapshot>,
  SnapshotPublisherState<TSnapshot>
>;

export const createPublishSnapshotMessageHandler = <
  TSnapshot
>(): PublishSnapshotMessageHandler<TSnapshot> => ({
  handleMessage: (
    state: SnapshotPublisherState<TSnapshot>,
    message: PublishSnapshotMessage<TSnapshot>
  ) => {
    const snapshotMessage: SnapshotMessage<TSnapshot> = {
      type: "snapshot",
      snapshot: message.snapshot,
    };

    for (const subscriber of state.subscribers) {
      dispatch(subscriber, snapshotMessage);
    }

    return state;
  },
  messageTypeGuard: isPublishSnapshotMessage__unsafe,
});
