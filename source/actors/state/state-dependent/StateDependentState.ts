import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Combiner } from "../combiner/Combiner";
import { MessageProcessor } from "./message-processor/MessageProcessor";

export type StateDependentState<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage
> = {
  readonly combiner: Combiner<TStateSnapshotsObject>;
  readonly messageProcessor: MessageProcessor<
    TStateSnapshotsObject,
    TEventMessage
  >;
};
