import { LocalActorRef, LocalActorSystemRef } from "@nact/core";
import { MaybeAsync } from "../../../data-types/MaybeAsync";
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
  eventReducer: MaybeAsync<
    (state: TState, eventMessage: TEventMessage) => TState
  >,
  valueSelector: MaybeAsync<(state: TState) => TOutputValue>,
  outputEqualityComparator: MaybeAsync<
    (previous: TOutputValue, current: TOutputValue) => boolean
  >,
  initialState: TState,
  options?: PureEventAuthorityOptions<TOutputValue, TSemanticSymbol>
): PureEventAuthority<TEventMessage, TOutputValue, TSemanticSymbol> =>
  spawnEventAuthority(
    parent,
    semanticSymbol,
    {},
    eventReducer,
    () => initialState,
    valueSelector,
    outputEqualityComparator,
    options
  ) as unknown as PureEventAuthority<
    TEventMessage,
    TOutputValue,
    TSemanticSymbol
  >;
