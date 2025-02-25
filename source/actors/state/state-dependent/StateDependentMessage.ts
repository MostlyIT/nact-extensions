import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";

export type StateDependentMessage<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TMessage
> =
  | TMessage
  | SnapshotMessage<
      TStateSnapshotsObject[keyof TStateSnapshotsObject & symbol]
    >;
