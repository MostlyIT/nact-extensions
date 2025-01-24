import { LocalActorRef } from "@nact/core";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { CombinerMessage } from "./CombinerMessage";

declare const combiner: unique symbol;

/**
 * An actor that combines state snapshots from different sources and relays them if all versions are compatible.
 */
export type Combiner<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  }
> = { [combiner]: true } & LocalActorRef<
  CombinerMessage<TStateSnapshotsObject>
>;
