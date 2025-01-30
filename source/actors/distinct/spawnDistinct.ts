import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { MaybeAsync } from "../../data-types/MaybeAsync";
import { spawnRelay } from "../relay/spawnRelay";
import { Distinct } from "./Distinct";
import { DistinctMessage } from "./DistinctMessage";
import { DistinctOptions } from "./DistinctOptions";
import { DistinctState } from "./DistinctState";

export const spawnDistinct = <TSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  equalityComparator: MaybeAsync<
    (previous: TSnapshot, current: TSnapshot) => boolean
  >,
  options?: DistinctOptions<TSnapshot>
): Distinct<TSnapshot> =>
  spawn(
    parent,
    async (
      state: DistinctState<TSnapshot>,
      message: DistinctMessage<TSnapshot>
    ): Promise<DistinctState<TSnapshot>> => {
      switch (message.type) {
        case "snapshot":
          if (
            state.hasSeenSnapshot &&
            (await equalityComparator(state.previousSnapshot, message.snapshot))
          ) {
            return state;
          }

          dispatch(state.relay, message);

          return {
            ...state,
            hasSeenSnapshot: true,
            previousSnapshot: message.snapshot,
          };
        case "set destination":
        case "unset destination":
          dispatch(state.relay, message);

          return state;
      }
    },
    {
      initialStateFunc: (context): DistinctState<TSnapshot> => ({
        hasSeenSnapshot: false,
        relay: spawnRelay(context.self, options),
      }),
    }
  ) as Distinct<TSnapshot>;
