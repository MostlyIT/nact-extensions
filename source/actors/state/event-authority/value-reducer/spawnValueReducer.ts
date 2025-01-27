import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { List } from "immutable";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";
import { spawnRelay } from "../../../relay/spawnRelay";
import { ValueReducer } from "./ValueReducer";
import { ValueReducerMessage } from "./ValueReducerMessage";
import { ValueReducerOptions } from "./ValueReducerOptions";
import { ValueReducerState } from "./ValueReducerState";

export const spawnValueReducer = <
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue,
  TState
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  eventReducer: (
    state: TState,
    eventMessage: TEventMessage,
    lastCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => TState,
  snapshotReducer: (
    state: TState | undefined,
    newCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => TState,
  valueSelector: (
    state: TState,
    lastCombinedObject: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    }
  ) => TOutputValue,
  options?: ValueReducerOptions<TStateSnapshotsObject, TOutputValue>
): ValueReducer<TStateSnapshotsObject, TEventMessage, TOutputValue> =>
  spawn(
    parent,
    (
      state: ValueReducerState<
        TStateSnapshotsObject,
        TEventMessage,
        TOutputValue,
        TState
      >,
      message: ValueReducerMessage<
        TStateSnapshotsObject,
        TEventMessage,
        TOutputValue
      >
    ): ValueReducerState<
      TStateSnapshotsObject,
      TEventMessage,
      TOutputValue,
      TState
    > => {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message
      ) {
        switch (message.type) {
          case "snapshot":
            const newInnerState = snapshotReducer(
              state.innerState,
              message.snapshot.value
            );

            // Will only trigger if there are unprocessed events.
            const newInnerStateFromUnprocessedEvents = (
              "unprocessedEventMessages" in state
                ? state.unprocessedEventMessages
                : List<TEventMessage>()
            ).reduce(
              (innerState, eventMessage) =>
                eventReducer(innerState, eventMessage, message.snapshot.value),
              newInnerState
            );

            dispatch(state.relay, {
              type: "snapshot",
              snapshot: {
                value: valueSelector(
                  newInnerStateFromUnprocessedEvents,
                  message.snapshot.value
                ),
                version: message.snapshot.version,
                semanticSymbol: undefined,
              },
            });

            return {
              lastCombinedObject: message.snapshot.value,
              lastCombinedVersion: message.snapshot.version,
              innerState: newInnerStateFromUnprocessedEvents,
              relay: state.relay,
            };
          case "set destination":
          case "unset destination":
            dispatch(state.relay, message);
            return state;
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

      // Unprocessed events doesn't exist and a combined snapshot has been observed.
      const newInnerState = eventReducer(
        state.innerState,
        message,
        state.lastCombinedObject
      );

      dispatch(state.relay, {
        type: "snapshot",
        snapshot: {
          value: valueSelector(newInnerState, state.lastCombinedObject),
          version: state.lastCombinedVersion,
          semanticSymbol: undefined,
        },
      });

      return {
        ...state,
        innerState: newInnerState,
      };
    },
    {
      initialStateFunc: (context) => ({
        innerState: undefined,
        relay: spawnRelay(context.self, options),
        unprocessedEventMessages: List<TEventMessage>(),
      }),
    }
  ) as ValueReducer<TStateSnapshotsObject, TEventMessage, TOutputValue>;
