import { MessageHandler } from "../../message-handlers/MessageHandler";
import { LocalActorSystemRef, spawn } from "../../vendored/@nact/core";

export const messageHandlerToActor = <TMessage>(
  system: LocalActorSystemRef,
  messageHandler: MessageHandler<TMessage>
) =>
  spawn(system, (state: undefined, message: TMessage) => {
    messageHandler(message);
    return state;
  });
