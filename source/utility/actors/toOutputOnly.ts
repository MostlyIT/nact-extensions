import { SetDestinationMessage } from "../../data-types/messages/SetDestinationMessage";
import {
  SnapshotOfSubscriptionMessage,
  SubscriptionMessage,
} from "../../data-types/messages/SubscriptionMessage";
import { UnsetDestinationMessage } from "../../data-types/messages/UnsetDestinationMessage";
import { LocalActorRef } from "../../vendored/@nact/core";

type DestinationMessage<TSnapshot> =
  | SetDestinationMessage<TSnapshot>
  | UnsetDestinationMessage;

type SnapshotOfSetDestinationMessage<TMessage> =
  TMessage extends SetDestinationMessage<infer TSnapshot> ? TSnapshot : never;

type OutputOnlyActor<TActor extends LocalActorRef<any>> =
  TActor extends LocalActorRef<infer TMessage>
    ? SubscriptionMessage<any> extends TMessage
      ? LocalActorRef<
          SubscriptionMessage<SnapshotOfSubscriptionMessage<TMessage>>
        >
      : DestinationMessage<any> extends TMessage
      ? LocalActorRef<
          DestinationMessage<SnapshotOfSetDestinationMessage<TMessage>>
        >
      : never
    : never;

export const toOutputOnly = <TActor extends LocalActorRef<any>>(
  actor: TActor
): OutputOnlyActor<TActor> => actor as unknown as OutputOnlyActor<TActor>;
