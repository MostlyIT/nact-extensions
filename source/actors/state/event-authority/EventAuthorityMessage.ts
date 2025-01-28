import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
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
  | SubscribeMessage<
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
    >
  | UnsubscribeMessage<
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
