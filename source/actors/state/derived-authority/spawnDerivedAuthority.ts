import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import { spawnPublisher } from "../../publisher/spawnPublisher";
import { spawnCombiner } from "../combiner/spawnCombiner";
import { spawnSemanticBrander } from "../semantic-brander/spawnSemanticBrander";
import { DerivedAuthority } from "./DerivedAuthority";
import { DerivedAuthorityMessage } from "./DerivedAuthorityMessage";
import { DerivedAuthorityOptions } from "./DerivedAuthorityOptions";
import { DerivedAuthorityState } from "./DerivedAuthorityState";
import { spawnValueSelector } from "./value-selector/spawnValueSelector";

export const spawnDerivedAuthority = <
  TStateSnapshotsObject extends {
    readonly [TKey in symbol]: StateSnapshot<any, any, TKey>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol,
  TValueSelectorCache
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  stateSnapshotSources: {
    readonly [key in keyof TStateSnapshotsObject & symbol]: LocalActorRef<
      SubscribeMessage<TStateSnapshotsObject[key]>
    >;
  },
  valueSelectorFunction: (
    inputs: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    },
    cache: TValueSelectorCache | undefined
  ) => { value: TOutputValue; cache: TValueSelectorCache | undefined },
  options?: DerivedAuthorityOptions<
    TStateSnapshotsObject,
    TOutputValue,
    TSemanticSymbol
  >
): DerivedAuthority<TStateSnapshotsObject, TOutputValue, TSemanticSymbol> =>
  spawn(
    parent,
    (
      state: DerivedAuthorityState<
        TStateSnapshotsObject,
        TOutputValue,
        TSemanticSymbol
      >,
      message: DerivedAuthorityMessage<
        TStateSnapshotsObject,
        TOutputValue,
        TSemanticSymbol
      >
    ): DerivedAuthorityState<
      TStateSnapshotsObject,
      TOutputValue,
      TSemanticSymbol
    > => {
      switch (message.type) {
        case "snapshot":
          dispatch(state.combiner, message);
          return state;
        case "subscribe":
        case "unsubscribe":
          dispatch(state.publisher, message);
          return state;
      }
    },
    {
      initialStateFunc: (context) => {
        const publisher = spawnPublisher(context.self, options);
        const semanticBrander = spawnSemanticBrander(
          context.self,
          semanticSymbol,
          {
            // @ts-expect-error
            initialDestination: publisher,
          }
        );
        const valueSelector = spawnValueSelector(
          context.self,
          valueSelectorFunction,
          {
            // @ts-expect-error
            initialDestination: semanticBrander,
          }
        );
        const combiner = spawnCombiner(context.self, stateSnapshotSources, {
          // @ts-expect-error
          initialDestination: valueSelector,
        });

        return {
          combiner,
          valueSelector,
          semanticBrander,
          publisher,
        } satisfies DerivedAuthorityState<
          TStateSnapshotsObject,
          TOutputValue,
          TSemanticSymbol
        >;
      },
    }
  ) as DerivedAuthority<TStateSnapshotsObject, TOutputValue, TSemanticSymbol>;
