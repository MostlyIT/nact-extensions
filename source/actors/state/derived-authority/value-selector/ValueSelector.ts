import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../../vendored/@nact/core";
import { ValueSelectorMessage } from "./ValueSelectorMessage";

declare const valueSelector: unique symbol;

export type ValueSelector<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TOutputValue
> = { [valueSelector]: true } & LocalActorRef<
  ValueSelectorMessage<TStateSnapshotsObject, TOutputValue>
>;
