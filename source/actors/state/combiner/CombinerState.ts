import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import { Relay } from "../../relay/Relay";

export type CombinerState<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  }
> = {
  readonly relay: Relay<
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
  >;
  readonly combinedStateSnapshotObject: {
    readonly [key in keyof TStateSnapshotsObject & symbol]:
      | TStateSnapshotsObject[key]
      | undefined;
  };
};
