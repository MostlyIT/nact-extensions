import {
  DestinationMessage,
  SnapshotOfDestinationMessage,
} from "../../data-types/messages/DestinationMessage";
import {
  SnapshotOfSubscriptionMessage,
  SubscriptionMessage,
} from "../../data-types/messages/SubscriptionMessage";
import { LocalActorRef } from "../../vendored/@nact/core";

// type SnapshotOfSetDestinationMessage<TMessage> =
//   TMessage extends SetDestinationMessage<infer TSnapshot> ? TSnapshot : never;

type OutputOnlyActor<TActor extends LocalActorRef<any>> =
  TActor extends LocalActorRef<infer TMessage>
    ? SubscriptionMessage<any> extends TMessage
      ? LocalActorRef<
          SubscriptionMessage<SnapshotOfSubscriptionMessage<TMessage>>
        >
      : DestinationMessage<any> extends TMessage
      ? LocalActorRef<
          DestinationMessage<SnapshotOfDestinationMessage<TMessage>>
        >
      : never
    : never;

export const toOutputOnly = <TActor extends LocalActorRef<any>>(
  actor: TActor
): OutputOnlyActor<TActor> => actor as unknown as OutputOnlyActor<TActor>;
