import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/StateSnapshot";
import { RelayOptions } from "../../relay/RelayOptions";

export type CombinerOptions<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  }
> = RelayOptions<
  SnapshotMessage<
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
  >
>;
