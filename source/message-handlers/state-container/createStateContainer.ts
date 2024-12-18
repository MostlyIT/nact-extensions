import { combineMessageHandlers } from "../../utility/message-handler/combineMessageHandlers";
import { reduceMessageHandler } from "../../utility/message-handler/reduceMessageHandler";
import { scopeMessageHandler } from "../../utility/message-handler/scopeMessageHandler";
import { combineTypeGuards } from "../../utility/types/combineTypeGuards";
import { createSnapshotPublisher } from "../snapshot-publisher/SnapshotPublisher";
import {
  isSubscribeMessage__unsafe,
  SubscribeMessage,
} from "../snapshot-publisher/messages/SubscribeMessage";
import {
  isUnsubscribeMessage__unsafe,
  UnsubscribeMessage,
} from "../snapshot-publisher/messages/UnsubscribeMessage";
import { createSetStateMessageHandler } from "./partial-message-handlers/SetStateMessageHandler";

export const createStateContainer = <TState, TSnapshot>(
  equalityComparer: (oldState: TState, newState: TState) => boolean,
  snapshotSelector: (state: TState) => TSnapshot
) => {
  const snapshotPublisher = createSnapshotPublisher<TSnapshot>();

  const stateContainer = combineMessageHandlers({
    "set state": createSetStateMessageHandler<TState, TSnapshot>(
      equalityComparer,
      snapshotPublisher,
      snapshotSelector
    ),
  });

  const scopedSnapshotPublisher = scopeMessageHandler(
    snapshotPublisher,
    "snapshotPublisherState"
  );
  const scopedAndReducedSnapshotPublisher = reduceMessageHandler(
    scopedSnapshotPublisher
  )<SubscribeMessage<TSnapshot> | UnsubscribeMessage<TSnapshot>>(
    combineTypeGuards({
      subscribeMessage: isSubscribeMessage__unsafe<TSnapshot>,
      unsubscribeMessage: isUnsubscribeMessage__unsafe<TSnapshot>,
    })
  );

  return combineMessageHandlers({
    stateContainer: stateContainer,
    snapshotPublisher: scopedAndReducedSnapshotPublisher,
  });
};

export type StateContainer<TState, TSnapshot> = ReturnType<
  typeof createStateContainer<TState, TSnapshot>
>;
