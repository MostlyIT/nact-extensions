import { MessageHandler } from "../../interfaces/MessageHandler";

export const scopeMessageHandler = <
  TMessage,
  TInnerState,
  TOuterState extends {
    [key in TStatePath]: TInnerState;
  },
  TStatePath extends string
>(
  messageHandler: MessageHandler<TMessage, TInnerState>,
  statePath: TStatePath
): MessageHandler<TMessage, TOuterState> => ({
  handleMessage: (state, message) => {
    return {
      ...state,
      [statePath]: messageHandler.handleMessage(state[statePath], message),
    };
  },
  messageTypeGuard: messageHandler.messageTypeGuard,
});
