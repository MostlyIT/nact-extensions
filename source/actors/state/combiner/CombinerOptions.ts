import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { RelayOptions } from "../../relay/RelayOptions";

export type CombinerOwnOptions = {
  readonly manageOwnSubscriptions?: boolean;
};

export type CombinerOptions<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  }
> = CombinerOwnOptions &
  RelayOptions<
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
