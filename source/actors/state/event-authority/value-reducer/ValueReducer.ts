import { LocalActorRef } from "@nact/core";
import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { ValueReducerMessage } from "./ValueReducerMessage";

declare const valueReducer: unique symbol;

export type ValueReducer<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue
> = { [valueReducer]: true } & LocalActorRef<
  ValueReducerMessage<TStateSnapshotsObject, TEventMessage, TOutputValue>
>;
