import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../../vendored/@nact/core";
import { ValueReducerMessage } from "./ValueReducerMessage";

export type ValueReducer<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue
> = LocalActorRef<
  ValueReducerMessage<TStateSnapshotsObject, TEventMessage, TOutputValue>
>;
