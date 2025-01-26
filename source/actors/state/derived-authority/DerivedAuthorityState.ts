import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";
import { ReplayPublisher } from "../../replay-publisher/ReplayPublisher";
import { Combiner } from "../combiner/Combiner";
import { SemanticBrander } from "../semantic-brander/SemanticBrander";
import { ValueSelector } from "./value-selector/ValueSelector";

export type DerivedAuthorityState<
  TStateSnapshotsObject extends {
    readonly [TKey in symbol]: StateSnapshot<any, any, TKey>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol
> = {
  readonly combiner: Combiner<TStateSnapshotsObject>;
  readonly valueSelector: ValueSelector<TStateSnapshotsObject, TOutputValue>;
  readonly semanticBrander: SemanticBrander<
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
