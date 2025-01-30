import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { MaybeAsync } from "../../data-types/MaybeAsync";
import { spawnRelay } from "../relay/spawnRelay";
import { Mapper } from "./Mapper";
import { MapperMessage } from "./MapperMessage";
import { MapperOptions } from "./MapperOptions";
import { MapperState } from "./MapperState";

export const spawnMapper = <TInputSnapshot, TOutputSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  mappingFunction: MaybeAsync<(input: TInputSnapshot) => TOutputSnapshot>,
  options?: MapperOptions<TOutputSnapshot>
): Mapper<TInputSnapshot, TOutputSnapshot> =>
  spawn(
    parent,
    async (
      state: MapperState<TOutputSnapshot>,
      message: MapperMessage<TInputSnapshot, TOutputSnapshot>
    ): Promise<MapperState<TOutputSnapshot>> => {
      switch (message.type) {
        case "snapshot":
          dispatch(state.relay, {
            type: "snapshot",
            snapshot: await mappingFunction(message.snapshot),
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
