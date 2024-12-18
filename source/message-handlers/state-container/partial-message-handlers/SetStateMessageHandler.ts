import { MessageHandler } from "../../MessageHandler";
import { SnapshotPublisher } from "../../snapshot-publisher/SnapshotPublisher";
import {
  isSetStateMessage__unsafe,
  SetStateMessage,
} from "../messages/SetStateMessage";
import { StateContainerState } from "../StateContainerState";

export type SetStateMessageHandler<TState, TSnapshot> = MessageHandler<
  SetStateMessage<TState>,
  StateContainerState<TState, TSnapshot>
>;

export const createSetStateMessageHandler = <TState, TSnapshot>(
  equalityComparer: (oldState: TState, newState: TState) => boolean,
  snapshotPublisher: SnapshotPublisher<TSnapshot>,
  snapshotSelector: (state: TState) => TSnapshot
): SetStateMessageHandler<TState, TSnapshot> => ({
  handleMessage: (state, message) => {
    const newState = message.stateCandidate;

    if (equalityComparer(state.state, newState)) {
      return state;
    }

    const snapshot = snapshotSelector(newState);

    return {
      state: newState,
      snapshotPublisherState: snapshotPublisher.handleMessage(
        state.snapshotPublisherState,
        {
          type: "publish snapshot",
          snapshot,
        }
      ),
    };
  },
  messageTypeGuard: isSetStateMessage__unsafe,
});
