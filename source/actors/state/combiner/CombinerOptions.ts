import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import { RelayOptions } from "../../relay/RelayOptions";

export type CombinerOptions<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  }
> = RelayOptions<
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
