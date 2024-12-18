import {
  MessageHandler,
  MessageOfMessageHandler,
  StateOfMessageHandler,
} from "../../interfaces/MessageHandler";
import { combineTypeGuards } from "../types/combineTypeGuards";

export const combineMessageHandlers = <
  TMessageHandlerObject extends {
    readonly [key: string]: MessageHandler<any, any>;
  }
>(
  messageHandlersObject: TMessageHandlerObject
): MessageHandler<
  MessageOfMessageHandler<TMessageHandlerObject[keyof TMessageHandlerObject]>,
  StateOfMessageHandler<TMessageHandlerObject[keyof TMessageHandlerObject]>
> => ({
  handleMessage: (state, message) => {
    for (const messageHandler of Object.values(messageHandlersObject)) {
      if (messageHandler.messageTypeGuard(message)) {
        return messageHandler.handleMessage(state, message);
      }
    }

    return state;
  },
  messageTypeGuard: combineTypeGuards(
    Object.fromEntries(
      Object.entries(messageHandlersObject).map(([key, value]) => [
        key,
        value.messageTypeGuard,
      ])
    )
  ),
});
