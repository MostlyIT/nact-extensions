import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../../data-types/state-snapshot/Version";
import { RelayOptions } from "../../../relay/RelayOptions";

export type ValueSelectorOptions<
  TStateSnapshotsObject extends {
    readonly [TKey in symbol]: StateSnapshot<any, any, TKey>;
  },
  TOutputValue
> = RelayOptions<
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
