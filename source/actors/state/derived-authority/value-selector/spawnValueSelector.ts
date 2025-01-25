import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import {
  StateSnapshot,
  ValueOfStateSnapshot,
} from "../../../../data-types/state-snapshot/StateSnapshot";
import { spawnRelay } from "../../../relay/spawnRelay";
import { ValueSelector } from "./ValueSelector";
import { ValueSelectorMessage } from "./ValueSelectorMessage";
import { ValueSelectorOptions } from "./ValueSelectorOptions";
import { ValueSelectorState } from "./ValueSelectorState";

/**
 * @param valueSelector The function that maps `inputs` to the output value. The `cache` parameter is filled with the output cache from the previous value selection. The cache can be used to optimize calculations. It should, however, never affect the output value, only the time it takes to find it.
 */
export const spawnValueSelector = <
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  },
  TOutputValue,
  TCache = undefined
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  valueSelector: (
    inputs: {
      readonly [key in keyof TStateSnapshotsObject &
        symbol]: ValueOfStateSnapshot<TStateSnapshotsObject[key]>;
    },
    cache: TCache | undefined
  ) => { value: TOutputValue; cache: TCache | undefined },
  options?: ValueSelectorOptions<TStateSnapshotsObject, TOutputValue>
): ValueSelector<TStateSnapshotsObject, TOutputValue> =>
  spawn(
    parent,
    (
      state: ValueSelectorState<TStateSnapshotsObject, TOutputValue, TCache>,
      message: ValueSelectorMessage<TStateSnapshotsObject, TOutputValue>
    ): ValueSelectorState<TStateSnapshotsObject, TOutputValue, TCache> => {
      switch (message.type) {
        case "snapshot":
          const { value, cache } = valueSelector(
            message.snapshot.value,
            state.cache
          );

          dispatch(state.relay, {
            type: "snapshot",
            snapshot: {
              value,
              version: message.snapshot.version,
              semanticSymbol: undefined,
            },
          });

          return {
            ...state,
            cache: cache,
          };
        case "set destination":
        case "unset destination":
          dispatch(state.relay, message);
          return state;
      }
    },
    {
      initialStateFunc: (context) => ({
        cache: undefined,
        relay: spawnRelay(context.self, options),
      }),
    }
  ) as ValueSelector<TStateSnapshotsObject, TOutputValue>;
