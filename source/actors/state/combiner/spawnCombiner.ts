import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/StateSnapshot";
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
  stateSnapshots: {
    readonly [key in keyof TStateSnapshotsObject]: LocalActorRef<
      SnapshotMessage<TStateSnapshotsObject[key]>
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
          return;
        case "set destination":
        case "unset destination":
          dispatch(state.relay, message);

          return state;
      }
    },
    {
      initialStateFunc: (context): CombinerState<TStateSnapshotsObject> => ({
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
      }),
    }
  );
