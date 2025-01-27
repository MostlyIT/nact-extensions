import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { Relay } from "../../relay/Relay";

export type CombinerState<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TUnsetSymbol extends symbol
> = {
  readonly relay: Relay<
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
  >;
  readonly combinedStateSnapshotObject: {
    readonly [key in keyof TStateSnapshotsObject & symbol]:
      | TStateSnapshotsObject[key]
      | TUnsetSymbol;
  };
};
