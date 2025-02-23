import { LocalActorRef } from "../../../vendored/@nact/core";
import { PureEventAuthorityMessage } from "./PureEventAuthorityMessage";

/**
 * An actor responsible for a specific piece of application state whose value can be changed directly through events.
 */
export type PureEventAuthority<
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> = LocalActorRef<
  PureEventAuthorityMessage<TEventMessage, TOutputValue, TSemanticSymbol>
>;
