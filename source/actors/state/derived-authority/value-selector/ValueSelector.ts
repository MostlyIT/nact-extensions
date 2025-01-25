import { LocalActorRef } from "@nact/core";
import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { ValueSelectorMessage } from "./ValueSelectorMessage";

declare const valueSelector: unique symbol;

export type ValueSelector<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  },
  TOutputValue
> = { [valueSelector]: true } & LocalActorRef<
  ValueSelectorMessage<TStateSnapshotsObject, TOutputValue>
>;
