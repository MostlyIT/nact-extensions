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
import { ReplayPublisherOptions } from "./ReplayPublisherOptions";
import { ReplayPublisherState } from "./ReplayPublisherState";

export const spawnReplayPublisher = <TSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  replayCount: number,
  options?: ReplayPublisherOptions<TSnapshot>
): ReplayPublisher<TSnapshot> =>
  spawn(
    parent,
    (
      state: ReplayPublisherState<TSnapshot>,
      message: ReplayPublisherMessage<TSnapshot>
    ): ReplayPublisherState<TSnapshot> => {
      switch (message.type) {
        case "snapshot":
          dispatch(state.publisher, message);

          return {
            ...state,
            history: state.history.withMutations((list) => {
              list.push(message);

              if (replayCount < list.count()) {
                list.shift();
              }
            }),
          };
        case "subscribe":
          for (const messageToReplay of state.history) {
            dispatch(message.subscriber, messageToReplay);
          }
        case "unsubscribe":
          dispatch(state.publisher, message);

          return state;
      }
    },
    {
      initialStateFunc: (context): ReplayPublisherState<TSnapshot> =>
        ({
          history: List<SnapshotMessage<TSnapshot>>(),
          publisher: spawnPublisher(context.self, options),
        } satisfies ReplayPublisherState<TSnapshot>),
    }
  ) as ReplayPublisher<TSnapshot>;
