import { List } from "immutable";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";
import {
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "../../../../vendored/@nact/core";
import { MessageProcessor } from "./MessageProcessor";
import { MessageProcessorMessage } from "./MessageProcessorMessage";
import { MessageProcessorState } from "./MessageProcessorState";

export const spawnMessageProcessor = <
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TState
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  eventProcessor: (
    state: TState,
    message: TEventMessage,
    lastCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => Promise<TState>,
  snapshotProcessor: (
    state: TState,
    newCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => Promise<TState>,
  initialState: TState
): MessageProcessor<TStateSnapshotsObject, TEventMessage> =>
  spawn(
    parent,
    async (
      state: MessageProcessorState<
        TStateSnapshotsObject,
        TEventMessage,
        TState
      >,
      message: MessageProcessorMessage<TStateSnapshotsObject, TEventMessage>
    ) => {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message
      ) {
        switch (message.type) {
          case "snapshot":
            const newInnerState = await snapshotProcessor(
              state.innerState,
              message.snapshot.value
            );

            // Will only trigger if there are unprocessed events.
            let loopInnerState = newInnerState;
            if ("unprocessedEventMessages" in state) {
              for (const eventMessage of state.unprocessedEventMessages) {
                loopInnerState = await eventProcessor(
                  loopInnerState,
                  eventMessage,
                  message.snapshot.value
                );
              }
            }
            const newInnerStateFromUnprocessedEvents = loopInnerState;

            return {
              innerState: newInnerStateFromUnprocessedEvents,
              lastCombinedObject: message.snapshot.value,
            };
        }
      }

      if ("unprocessedEventMessages" in state) {
        // If unprocessed events still exist, simply add the new event to the list.
        return {
          ...state,
          unprocessedEventMessages:
            state.unprocessedEventMessages.push(message),
        };
      }

      const newInnerState = await eventProcessor(
        state.innerState,
        message,
        state.lastCombinedObject
      );

      return {
        ...state,
        innerState: newInnerState,
      };
    },
    {
      initialStateFunc: (_context) => ({
        innerState: initialState,
        unprocessedEventMessages: List<TEventMessage>(),
      }),
    }
  );
