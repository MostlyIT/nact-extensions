import { PartialMessageHandler } from "../../interfaces/PartialMessageHandler";
import { PublishSnapshotMessage } from "../snapshot-publisher/PublishSnapshotMessage";
import { SetStateMessage } from "./SetStateMessage";

export const generateStateContainer = <TState, TSnapshot, TThroughMessage>(
  equalityCheck: (oldState: TState, newState: TState) => boolean,
  snapshotSelector: (state: TState) => TSnapshot
): PartialMessageHandler<
  SetStateMessage<TState>,
  PublishSnapshotMessage<TSnapshot>,
  TThroughMessage,
  {
    readonly containedState: TState;
  }
> => {
  return (state, message) => {
    if (typeof message === "object" && message !== null && "type" in message) {
      if (message.type === "set state") {
        if (equalityCheck(state.containedState, message.state)) {
          return {
            state,
            messages: [],
          };
        }

        const snapshot = snapshotSelector(message.state);
        const publishSnapshotMessage: PublishSnapshotMessage<TSnapshot> = {
          type: "publish snapshot",
          snapshot: snapshot,
        };

        return {
          state: {
            containedState: message.state,
          },
          messages: [publishSnapshotMessage],
        };
      }
    }

    const throughMessage = message as TThroughMessage;

    // Message was not recognized, so it is passed through.

    return {
      state,
      messages: [throughMessage],
    };
  };
};
