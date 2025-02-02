import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import { ownValues } from "../../../utility/ownValues";
import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "../../../vendored/@nact/core";
import { spawnReplayPublisher } from "../../replay-publisher/spawnReplayPublisher";
import { spawnCombiner } from "../combiner/spawnCombiner";
import { spawnSemanticBrander } from "../semantic-brander/spawnSemanticBrander";
import { DerivedAuthority } from "./DerivedAuthority";
import { DerivedAuthorityMessage } from "./DerivedAuthorityMessage";
import { DerivedAuthorityOptions } from "./DerivedAuthorityOptions";
import { DerivedAuthorityState } from "./DerivedAuthorityState";
import { spawnValueSelector } from "./value-selector/spawnValueSelector";

export const spawnDerivedAuthority = <
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol,
  TValueSelectorCache
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  stateSnapshotSources: {
    readonly [key in keyof TStateSnapshotsObject & symbol]: LocalActorRef<
      | SubscribeMessage<TStateSnapshotsObject[key]>
      | UnsubscribeMessage<TStateSnapshotsObject[key]>
    >;
  },
  valueSelectorFunction: (
    inputs: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    },
    cache: TValueSelectorCache | undefined
  ) => Promise<{ value: TOutputValue; cache: TValueSelectorCache | undefined }>,
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
          dispatch(state.replayPublisher, message);
          return state;
      }
    },
    {
      afterStop: (_state, context) => {
        if (options !== undefined && options.manageOwnSubscriptions === true) {
          for (const stateSnapshotSource of ownValues(stateSnapshotSources)) {
            dispatch(stateSnapshotSource, {
              type: "unsubscribe",
              subscriber: context.self,
            });
          }
        }
      },
      initialStateFunc: (context) => {
        if (options !== undefined && options.manageOwnSubscriptions === true) {
          for (const stateSnapshotSource of ownValues(stateSnapshotSources)) {
            dispatch(stateSnapshotSource, {
              type: "subscribe",
              subscriber: context.self,
            });
          }
        }

        const replayPublisher = spawnReplayPublisher(context.self, 1, options);
        const semanticBrander = spawnSemanticBrander(
          context.self,
          semanticSymbol,
          {
            initialDestination: replayPublisher,
          }
        );
        const valueSelector = spawnValueSelector(
          context.self,
          valueSelectorFunction,
          {
            initialDestination: semanticBrander,
          }
        );
        const combiner = spawnCombiner(context.self, stateSnapshotSources, {
          initialDestination: valueSelector,
          manageOwnSubscriptions: false,
        });

        return {
          combiner,
          valueSelector,
          semanticBrander,
          replayPublisher,
        } satisfies DerivedAuthorityState<
          TStateSnapshotsObject,
          TOutputValue,
          TSemanticSymbol
        >;
      },
    }
  ) as DerivedAuthority<TStateSnapshotsObject, TOutputValue, TSemanticSymbol>;
