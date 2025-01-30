import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { PublisherOptions } from "../../publisher/PublisherOptions";
import { CombinerOwnOptions } from "../combiner/CombinerOptions";

export type EventAuthorityOptions<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol
> = CombinerOwnOptions &
  PublisherOptions<
    StateSnapshot<
      TOutputValue,
      Version<
        KeyOfVersion<
          VersionOfStateSnapshot<
            TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
          >
        >
      >,
      TSemanticSymbol
    >
  >;
