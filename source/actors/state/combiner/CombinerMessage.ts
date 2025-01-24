import { SetDestinationMessage } from "../../../data-types/messages/SetDestinationMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../../data-types/messages/UnsetDestinationMessage";
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
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  }
> =
  | SetDestinationMessage<
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
  | SnapshotMessage<TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]>
  | UnsetDestinationMessage;
