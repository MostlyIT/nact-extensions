import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { spawnRelay } from "../relay/spawnRelay";
import { Mapper } from "./Mapper";
import { MapperMessage } from "./MapperMessage";
import { MapperOptions } from "./MapperOptions";
import { MapperState } from "./MapperState";

export const spawnMapper = <TInputSnapshot, TOutputSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  mappingFunction: (input: TInputSnapshot) => TOutputSnapshot,
  options?: MapperOptions<TOutputSnapshot>
): Mapper<TInputSnapshot, TOutputSnapshot> =>
  spawn(
    parent,
    (
      state: MapperState<TOutputSnapshot>,
      message: MapperMessage<TInputSnapshot, TOutputSnapshot>
    ): MapperState<TOutputSnapshot> => {
      switch (message.type) {
        case "snapshot":
          dispatch(state.relay, {
            type: "snapshot",
            snapshot: mappingFunction(message.snapshot),
          });

          return state;
        case "set destination":
        case "unset destination":
          dispatch(state.relay, message);

          return state;
      }
    },
    {
      initialStateFunc: (context): MapperState<TOutputSnapshot> => ({
        relay: spawnRelay(context.self, options),
      }),
    }
  ) as Mapper<TInputSnapshot, TOutputSnapshot>;
