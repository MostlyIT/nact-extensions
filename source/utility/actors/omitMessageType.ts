import { LocalActorRef } from "../../vendored/@nact/core";

export const omitMessageType = <TMessage>() => ({
  fromActor: <TActor extends LocalActorRef<TMessage>>(
    actor: TActor
  ): TActor extends LocalActorRef<infer TWholeMessage>
    ? LocalActorRef<Exclude<TWholeMessage, TMessage>>
    : never =>
    actor as unknown as TActor extends LocalActorRef<infer TWholeMessage>
      ? LocalActorRef<Exclude<TWholeMessage, TMessage>>
      : never,
});
