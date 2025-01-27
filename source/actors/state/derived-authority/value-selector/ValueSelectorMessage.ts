import { SetDestinationMessage } from "../../../../data-types/messages/SetDestinationMessage";
import { SnapshotMessage } from "../../../../data-types/messages/SnapshotMessage";
import { UnsetDestinationMessage } from "../../../../data-types/messages/UnsetDestinationMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../../data-types/state-snapshot/Version";

export type ValueSelectorMessage<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TOutputValue
> =
  | SetDestinationMessage<
      StateSnapshot<
        TOutputValue,
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
  | UnsetDestinationMessage;
