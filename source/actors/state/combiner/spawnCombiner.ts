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
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import { mapValues } from "../../../utility/mapValues";
import { ownValues } from "../../../utility/ownValues";
import { combineVersions } from "../../../utility/state-snapshot/combineVersions";
import { spawnRelay } from "../../relay/spawnRelay";
import { CombinerMessage } from "./CombinerMessage";
import { CombinerOptions } from "./CombinerOptions";
import { CombinerState } from "./CombinerState";

export const spawnCombiner = <
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  }
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  stateSnapshotSources: {
    readonly [key in keyof TStateSnapshotsObject & symbol]: LocalActorRef<
      SubscribeMessage<TStateSnapshotsObject[key]>
    >;
  },
  options?: CombinerOptions<TStateSnapshotsObject>
) =>
  spawn(
    parent,
    (
      state: CombinerState<TStateSnapshotsObject>,
      message: CombinerMessage<TStateSnapshotsObject>
    ): CombinerState<TStateSnapshotsObject> => {
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
              (stateSnapshot) => stateSnapshot === undefined
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

          const combinedVersion =
            combineVersionResult.value as VersionOfStateSnapshot<
              {
                readonly [key in keyof TStateSnapshotsObject &
                  symbol]: TStateSnapshotsObject[key];
              }[keyof TStateSnapshotsObject & symbol]
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
      initialStateFunc: (context): CombinerState<TStateSnapshotsObject> => {
        for (const key of Reflect.ownKeys(stateSnapshotSources)) {
          const stateSnapshotSource = stateSnapshotSources[key as symbol];
          dispatch(stateSnapshotSource, {
            type: "subscribe",
            // @ts-expect-error
            subscriber: context.self,
          });
        }

        return {
          combinedStateSnapshotObject: mapValues(
            stateSnapshotSources,
            () => undefined
          ),
          relay: spawnRelay<
            StateSnapshot<
              {
                readonly [key in keyof TStateSnapshotsObject &
                  symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
              },
              VersionOfStateSnapshot<
                TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
              >,
              undefined
            >
          >(context.self, options),
        };
      },
    }
  );
