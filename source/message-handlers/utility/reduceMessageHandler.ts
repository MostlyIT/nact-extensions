import { MessageHandler } from "../MessageHandler";

export const reduceMessageHandler =
  <TMessage, TState>(messageHandler: MessageHandler<TMessage, TState>) =>
  <TReducedMessage extends TMessage>(
    reducedMessageTypeGuard: (message: TMessage) => message is TReducedMessage
  ): MessageHandler<TReducedMessage, TState> => ({
    handleMessage: messageHandler.handleMessage,
    messageTypeGuard: reducedMessageTypeGuard,
  });
