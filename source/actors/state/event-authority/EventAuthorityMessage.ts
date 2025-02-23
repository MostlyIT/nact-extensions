import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";

export type EventAuthorityMessage<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> =
  | TEventMessage
  | SnapshotMessage<TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]>
  | SubscriptionMessage<
      StateSnapshot<
        TOutputValue,
        Version<
          | KeyOfVersion<
              VersionOfStateSnapshot<
                TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
              >
            >
          | TSemanticSymbol
        >,
        TSemanticSymbol
      >
    >;
