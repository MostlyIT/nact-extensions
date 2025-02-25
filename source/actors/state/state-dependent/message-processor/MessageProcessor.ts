import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../../vendored/@nact/core";
import { MessageProcessorMessage } from "./MessageProcessorMessage";

export type MessageProcessor<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage
> = LocalActorRef<
  MessageProcessorMessage<TStateSnapshotsObject, TEventMessage>
>;
