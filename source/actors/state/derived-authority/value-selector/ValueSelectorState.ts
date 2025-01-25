import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../../data-types/state-snapshot/Version";
import { Relay } from "../../../relay/Relay";

export type ValueSelectorState<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  },
  TOutputValue,
  TCache
> = {
  cache: TCache;
  relay: Relay<
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
};
