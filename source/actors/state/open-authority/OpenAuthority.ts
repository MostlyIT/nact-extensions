import { LocalActorRef } from "../../../vendored/@nact/core";
import { OpenAuthorityMessage } from "./OpenAuthorityMessage";

declare const openAuthority: unique symbol;

/**
 * An actor responsible for a piece of application state that can be directly modified through replace and transform operations.
 */
export type OpenAuthority<TValue, TSemanticSymbol extends symbol> = {
  [openAuthority]: true;
} & LocalActorRef<OpenAuthorityMessage<TValue, TSemanticSymbol>>;

// Basic

export type ValueOfOpenAuthority<
  TOpenAuthority extends OpenAuthority<any, any>
> = TOpenAuthority extends OpenAuthority<infer TValue, any> ? TValue : never;

export type SemanticSymbolOfOpenAuthority<
  TOpenAuthority extends OpenAuthority<any, any>
> = TOpenAuthority extends OpenAuthority<any, infer TSemanticSymbol>
  ? TSemanticSymbol
  : never;
