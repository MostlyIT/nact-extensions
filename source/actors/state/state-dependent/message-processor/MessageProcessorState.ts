import { List } from "immutable";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";

export type MessageProcessorState<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TState
> = {
  readonly innerState: TState;
} & (
  | {
      readonly lastCombinedObject: {
        readonly [key in keyof TStateSnapshotsObject &
          symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
      };
    }
  | {
      readonly unprocessedEventMessages: List<TEventMessage>;
    }
);
