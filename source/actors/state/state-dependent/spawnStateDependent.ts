import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
} from "../../../data-types/state-snapshot/StateSnapshot";
import { ownValues } from "../../../utility";
import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "../../../vendored/@nact/core";
import { spawnCombiner } from "../combiner/spawnCombiner";
import { spawnMessageProcessor } from "./message-processor/spawnMessageProcessor";
import { StateDependent } from "./StateDependent";
import { StateDependentMessage } from "./StateDependentMessage";
import { StateDependentOptions } from "./StateDependentOptions";
import { StateDependentState } from "./StateDependentState";

export const spawnStateDependent = <
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TState
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  stateSnapshotSources: {
    readonly [key in keyof TStateSnapshotsObject & symbol]: LocalActorRef<
      SubscriptionMessage<TStateSnapshotsObject[key]>
    >;
  },
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
  initialState: TState,
  options?: StateDependentOptions
): StateDependent<TStateSnapshotsObject, TEventMessage> =>
  spawn(
    parent,
    async (
      state: StateDependentState<TStateSnapshotsObject, TEventMessage>,
      message: StateDependentMessage<TStateSnapshotsObject, TEventMessage>
    ): Promise<StateDependentState<TStateSnapshotsObject, TEventMessage>> => {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message
      ) {
        switch (message.type) {
          case "snapshot":
            dispatch(state.combiner, message);
            return state;
        }
      }

      dispatch(state.messageProcessor, message);

      return state;
    },
    {
      afterStop: (_state, context) => {
        if (options !== undefined && options.manageOwnSubscriptions === true) {
          for (const stateSnapshotSource of ownValues(stateSnapshotSources)) {
            dispatch(stateSnapshotSource, {
              type: "unsubscribe",
              subscriber: context.self,
            });
          }
        }
      },
      initialStateFunc: (context) => {
        if (options !== undefined && options.manageOwnSubscriptions === true) {
          for (const stateSnapshotSource of ownValues(stateSnapshotSources)) {
            dispatch(stateSnapshotSource, {
              type: "subscribe",
              subscriber: context.self,
            });
          }
        }

        const messageProcessor = spawnMessageProcessor(
          context.self,
          eventProcessor,
          snapshotProcessor,
          initialState
        );

        const combiner = spawnCombiner(context.self, stateSnapshotSources, {
          initialDestination: messageProcessor,
        });

        return {
          combiner,
          messageProcessor,
        };
      },
    }
  );
