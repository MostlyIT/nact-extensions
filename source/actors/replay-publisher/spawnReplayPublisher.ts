import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { List } from "immutable";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { spawnPublisher } from "../publisher/spawnPublisher";
import { ReplayPublisher } from "./ReplayPublisher";
import { ReplayPublisherMessage } from "./ReplayPublisherMessage";
import { ReplayPublisherState } from "./ReplayPublisherState";

export const spawnReplayPublisher = <TSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  replayCount: number
): ReplayPublisher<TSnapshot> =>
  spawn(
    parent,
    (
      state: ReplayPublisherState<TSnapshot>,
      message: ReplayPublisherMessage<TSnapshot>,
      context
    ): ReplayPublisherState<TSnapshot> => {
      const stateWithEnsuredPublisher =
        state.publisher === "uninitialized"
          ? {
              ...state,
              publisher: spawnPublisher<TSnapshot>(context.self),
            }
          : state;

      switch (message.type) {
        case "snapshot":
          dispatch(stateWithEnsuredPublisher.publisher, message);

          return {
            ...stateWithEnsuredPublisher,
            history: stateWithEnsuredPublisher.history.withMutations((list) => {
              list.push(message);

              if (stateWithEnsuredPublisher.maxHistoryLength < list.count()) {
                list.shift();
              }
            }),
          };
        case "subscribe":
          for (const messageToReplay of state.history) {
            dispatch(message.subscriber, messageToReplay);
          }
        case "unsubscribe":
          dispatch(stateWithEnsuredPublisher.publisher, message);

          return stateWithEnsuredPublisher;
      }
    },
    {
      initialState: {
        history: List<SnapshotMessage<TSnapshot>>(),
        maxHistoryLength: replayCount,
        publisher: "uninitialized",
      } satisfies ReplayPublisherState<TSnapshot>,
    }
  ) as ReplayPublisher<TSnapshot>;
