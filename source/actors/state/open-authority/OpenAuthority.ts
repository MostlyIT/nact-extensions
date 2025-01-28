import { LocalActorRef } from "@nact/core";
import { OpenAuthorityMessage } from "./OpenAuthorityMessage";

declare const openAuthority: unique symbol;

/**
 * An actor responsible for a piece of application state that can be directly modified through replace and transform operations.
 */
export type OpenAuthority<TValue, TSemanticSymbol extends symbol> = {
  [openAuthority]: true;
} & LocalActorRef<OpenAuthorityMessage<TValue, TSemanticSymbol>>;
