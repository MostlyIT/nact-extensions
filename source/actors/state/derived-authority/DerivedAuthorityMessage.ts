import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";

export type DerivedAuthorityMessage<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
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
  | UnsubscribeMessage<
      StateSnapshot<
        TOutputValue,
        VersionOfStateSnapshot<
          TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
        >,
        TSemanticSymbol
      >
    >;
