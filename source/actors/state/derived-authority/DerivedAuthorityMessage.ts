import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";

export type DerivedAuthorityMessage<
  TStateSnapshotsObject extends {
    readonly [TKey in symbol]: StateSnapshot<any, any, TKey>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol
> =
  | SubscribeMessage<
      StateSnapshot<
        TOutputValue,
        VersionOfStateSnapshot<
          TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
        >,
        TSemanticSymbol
      >
    >
  | SnapshotMessage<TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]>
  | UnsubscribeMessage<
      StateSnapshot<
        TOutputValue,
        VersionOfStateSnapshot<
          TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
        >,
        TSemanticSymbol
      >
    >;
