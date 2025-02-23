import { DestinationMessage } from "../../../data-types/messages/DestinationMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";

export type CombinerMessage<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  }
> =
  | DestinationMessage<
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
    >
  | SnapshotMessage<
      TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
    >;
