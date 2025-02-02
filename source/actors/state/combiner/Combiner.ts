import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { CombinerMessage } from "./CombinerMessage";

declare const combiner: unique symbol;

/**
 * An actor that combines state snapshots from different sources and relays them if all versions are compatible.
 */
export type Combiner<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  }
> = { [combiner]: true } & LocalActorRef<
  CombinerMessage<TStateSnapshotsObject>
>;
