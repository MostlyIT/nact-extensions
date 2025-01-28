import { LocalActorRef } from "@nact/core";
import { PureEventAuthorityMessage } from "./PureEventAuthorityMessage";

declare const pureEventAuthority: unique symbol;

/**
 * An actor responsible for a specific piece of application state whose value can be changed directly through events.
 */
export type PureEventAuthority<
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> = { [pureEventAuthority]: true } & LocalActorRef<
  PureEventAuthorityMessage<TEventMessage, TOutputValue, TSemanticSymbol>
>;
