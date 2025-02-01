import { LocalActorRef, LocalActorSystemRef } from "@nact/core";
import { spawnEventAuthority } from "../event-authority/spawnEventAuthority";
import { PureEventAuthority } from "./PureEventAuthority";
import { PureEventAuthorityOptions } from "./PureEventAuthorityOptions";

export const spawnPureEventAuthority = <
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol,
  TState
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  eventReducer: (state: TState, eventMessage: TEventMessage) => Promise<TState>,
  valueSelector: (state: TState) => Promise<TOutputValue>,
  outputEqualityComparator: (
    previous: TOutputValue,
    current: TOutputValue
  ) => Promise<boolean>,
  initialState: TState,
  options?: PureEventAuthorityOptions<TOutputValue, TSemanticSymbol>
): PureEventAuthority<TEventMessage, TOutputValue, TSemanticSymbol> =>
  spawnEventAuthority(
    parent,
    semanticSymbol,
    {},
    eventReducer,
    async () => initialState,
    valueSelector,
    outputEqualityComparator,
    options
  ) as unknown as PureEventAuthority<
    TEventMessage,
    TOutputValue,
    TSemanticSymbol
  >;
