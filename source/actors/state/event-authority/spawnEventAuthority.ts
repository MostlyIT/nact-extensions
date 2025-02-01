import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { ownKeys } from "../../../utility/ownKeys";
import { ownValues } from "../../../utility/ownValues";
import { areVersionsEqual } from "../../../utility/state-snapshot/areVersionsEqual";
import { spawnDistinct } from "../../distinct/spawnDistinct";
import { spawnReplayPublisher } from "../../replay-publisher/spawnReplayPublisher";
import { spawnCombiner } from "../combiner/spawnCombiner";
import { spawnVersioner } from "../versioner/spawnVersioner";
import { EventAuthority } from "./EventAuthority";
import { EventAuthorityMessage } from "./EventAuthorityMessage";
import { EventAuthorityOptions } from "./EventAuthorityOptions";
import { EventAuthorityState } from "./EventAuthorityState";
import { spawnValueReducer } from "./value-reducer/spawnValueReducer";
import { ValueReducerMessage } from "./value-reducer/ValueReducerMessage";

export const spawnEventAuthority = <
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol,
  TState
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  stateSnapshotSources: {
    readonly [key in keyof TStateSnapshotsObject & symbol]: LocalActorRef<
      | SubscribeMessage<TStateSnapshotsObject[key]>
      | UnsubscribeMessage<TStateSnapshotsObject[key]>
    >;
  },
  eventReducer: (
    state: TState,
    eventMessage: TEventMessage,
    lastCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => Promise<TState>,
  snapshotReducer: (
    state: TState | undefined,
    newCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => Promise<TState>,
  valueSelector: (
    state: TState,
    lastCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => Promise<TOutputValue>,
  outputEqualityComparator: (
    previous: TOutputValue,
    current: TOutputValue
  ) => Promise<boolean>,
  options?: EventAuthorityOptions<
    TStateSnapshotsObject,
    TOutputValue,
    TSemanticSymbol
  >
): EventAuthority<
  TStateSnapshotsObject,
  TEventMessage,
  TOutputValue,
  TSemanticSymbol
> =>
  spawn(
    parent,
    (
      state: EventAuthorityState<
        TStateSnapshotsObject,
        TEventMessage,
        TOutputValue,
        TSemanticSymbol
      >,
      message: EventAuthorityMessage<
        TStateSnapshotsObject,
        TEventMessage,
        TOutputValue,
        TSemanticSymbol
      >
    ): EventAuthorityState<
      TStateSnapshotsObject,
      TEventMessage,
      TOutputValue,
      TSemanticSymbol
    > => {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message
      ) {
        switch (message.type) {
          case "snapshot":
            dispatch(state.combiner, message);
            return state;
          case "subscribe":
          case "unsubscribe":
            dispatch(state.replayPublisher, message);
            return state;
        }
      }

      dispatch(state.valueReducer, message);
      return state;
    },
    {
      afterStop: (_state, context) => {
        if (options !== undefined && options.manageOwnSubscriptions === true) {
          for (const stateSnapshotSource of ownValues(stateSnapshotSources)) {
            // @ts-expect-error
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
            // @ts-expect-error
            dispatch(stateSnapshotSource, {
              type: "subscribe",
              subscriber: context.self,
            });
          }
        }

        const replayPublisher = spawnReplayPublisher(context.self, 1, options);
        const versioner = spawnVersioner(context.self, semanticSymbol, {
          // @ts-expect-error
          initialDestination: replayPublisher,
        });
        const distinct = spawnDistinct(
          context.self,
          async (
            previous: StateSnapshot<
              TOutputValue,
              Version<
                KeyOfVersion<
                  VersionOfStateSnapshot<
                    TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
                  >
                >
              >,
              undefined
            >,
            current: StateSnapshot<
              TOutputValue,
              Version<
                KeyOfVersion<
                  VersionOfStateSnapshot<
                    TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
                  >
                >
              >,
              undefined
            >
          ) =>
            areVersionsEqual(previous.version, current.version) &&
            (await outputEqualityComparator(previous.value, current.value)),
          {
            // @ts-expect-error
            initialDestination: versioner,
          }
        );
        const valueReducer = spawnValueReducer(
          context.self,
          eventReducer,
          snapshotReducer,
          valueSelector,
          {
            // @ts-expect-error
            initialDestination: distinct,
          }
        );
        const combiner = spawnCombiner(context.self, stateSnapshotSources, {
          // @ts-expect-error
          initialDestination: valueReducer,
        });

        // If there are no inputs, valueReducer needs one empty state snapshot to get started.
        if (ownKeys(stateSnapshotSources).length === 0) {
          dispatch(valueReducer, {
            type: "snapshot",
            snapshot: {
              value: {},
              version: {},
              semanticSymbol: undefined,
            },
          } as ValueReducerMessage<TStateSnapshotsObject, TEventMessage, TOutputValue>);
        }

        return {
          combiner,
          valueReducer,
          distinct,
          versioner,
          replayPublisher,
        };
      },
    }
  ) as EventAuthority<
    TStateSnapshotsObject,
    TEventMessage,
    TOutputValue,
    TSemanticSymbol
  >;
