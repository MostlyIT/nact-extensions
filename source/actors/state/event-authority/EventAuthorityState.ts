import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { Distinct } from "../../distinct/Distinct";
import { ReplayPublisher } from "../../replay-publisher/ReplayPublisher";
import { Combiner } from "../combiner/Combiner";
import { Versioner } from "../versioner/Versioner";
import { ValueReducer } from "./value-reducer/ValueReducer";

export type EventAuthorityState<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> = {
  readonly combiner: Combiner<TStateSnapshotsObject>;
  readonly valueReducer: ValueReducer<
    TStateSnapshotsObject,
    TEventMessage,
    TOutputValue
  >;
  readonly distinct: Distinct<
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
  readonly versioner: Versioner<
    TOutputValue,
    Version<
      KeyOfVersion<
        VersionOfStateSnapshot<
          TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
        >
      >
    >,
    TSemanticSymbol
  >;
  readonly replayPublisher: ReplayPublisher<
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
};
