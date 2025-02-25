import { List } from "immutable";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
  VersionOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../../data-types/state-snapshot/Version";
import { Relay } from "../../../relay/Relay";

export type ValueReducerState<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue,
  TState
> = {
  readonly innerState: TState;
  readonly relay: Relay<
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
  >;
} & (
  | {
      readonly lastCombinedObject: {
        readonly [key in keyof TStateSnapshotsObject &
          symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
      };
      readonly lastCombinedVersion: Version<
        KeyOfVersion<
          VersionOfStateSnapshot<
            TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
          >
        >
      >;
    }
  | {
      readonly unprocessedEventMessages: List<TEventMessage>;
    }
);
