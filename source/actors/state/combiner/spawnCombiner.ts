import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { mapValues } from "../../../utility/mapValues";
import { ownValues } from "../../../utility/ownValues";
import { combineVersions } from "../../../utility/state-snapshot/combineVersions";
import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "../../../vendored/@nact/core";
import { spawnRelay } from "../../relay/spawnRelay";
import { Combiner } from "./Combiner";
import { CombinerMessage } from "./CombinerMessage";
import { CombinerOptions } from "./CombinerOptions";
import { CombinerState } from "./CombinerState";

const unsetSymbol = Symbol();

export const spawnCombiner = <
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  }
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  stateSnapshotSources: {
    readonly [key in keyof TStateSnapshotsObject & symbol]: LocalActorRef<
      SubscriptionMessage<TStateSnapshotsObject[key]>
    >;
  },
  options?: CombinerOptions<TStateSnapshotsObject>
): Combiner<TStateSnapshotsObject> =>
  spawn(
    parent,
    (
      state: CombinerState<TStateSnapshotsObject, typeof unsetSymbol>,
      message: CombinerMessage<TStateSnapshotsObject>
    ): CombinerState<TStateSnapshotsObject, typeof unsetSymbol> => {
      switch (message.type) {
        case "snapshot":
          state = {
            ...state,
            combinedStateSnapshotObject: {
              ...state.combinedStateSnapshotObject,
              [message.snapshot.semanticSymbol]: message.snapshot,
            },
          };

          const partialStateSnapshotsList = ownValues(
            state.combinedStateSnapshotObject
          );

          if (
            partialStateSnapshotsList.some(
              (stateSnapshot) => stateSnapshot === unsetSymbol
            )
          ) {
            break;
          }

          const stateSnapshotList = partialStateSnapshotsList as {
            readonly [key in keyof TStateSnapshotsObject &
              symbol]: TStateSnapshotsObject[key];
          }[keyof TStateSnapshotsObject & symbol][];

          const combineVersionResult = combineVersions(stateSnapshotList);
          if (combineVersionResult.type === "incompatible") {
            break;
          }

          const combinedVersion = combineVersionResult.value as Version<
            KeyOfVersion<
              VersionOfStateSnapshot<
                {
                  readonly [key in keyof TStateSnapshotsObject &
                    symbol]: TStateSnapshotsObject[key];
                }[keyof TStateSnapshotsObject & symbol]
              >
            >
          >;

          dispatch(state.relay, {
            type: "snapshot",
            snapshot: {
              value: mapValues(
                state.combinedStateSnapshotObject as {
                  readonly [key in keyof TStateSnapshotsObject &
                    symbol]: TStateSnapshotsObject[key];
                },
                (stateSnapshot) => stateSnapshot.value
              ),
              version: combinedVersion,
              semanticSymbol: undefined,
            },
          });

          break;
        case "set destination":
        case "unset destination":
          dispatch(state.relay, message);
          break;
      }

      return state;
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
      initialStateFunc: (
        context
      ): CombinerState<TStateSnapshotsObject, typeof unsetSymbol> => {
        if (options !== undefined && options.manageOwnSubscriptions === true) {
          for (const stateSnapshotSource of ownValues(stateSnapshotSources)) {
            dispatch(stateSnapshotSource, {
              type: "subscribe",
              subscriber: context.self,
            });
          }
        }

        return {
          combinedStateSnapshotObject: mapValues(
            stateSnapshotSources,
            () => unsetSymbol
          ),
          relay: spawnRelay<
            StateSnapshot<
              {
                readonly [key in keyof TStateSnapshotsObject &
                  symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
              },
              Version<
                KeyOfVersion<
                  VersionOfStateSnapshot<
                    TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
                  >
                >
              >,
              undefined
            >
          >(context.self, options),
        };
      },
    }
  ) as Combiner<TStateSnapshotsObject>;
