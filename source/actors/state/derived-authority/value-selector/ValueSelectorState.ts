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
    readonly [TKey in symbol]: StateSnapshot<any, any, TKey>;
  },
  TOutputValue,
  TCache = undefined
> = {
  cache: TCache | undefined;
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
