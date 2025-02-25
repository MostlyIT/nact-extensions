import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { StateDependentMessage } from "./StateDependentMessage";

/**
 * An actor that is dependent on state for its message processing, but that does not itself control any application state.
 */
export type StateDependent<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TMessage
> = LocalActorRef<StateDependentMessage<TStateSnapshotsObject, TMessage>>;
