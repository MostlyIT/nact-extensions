import {
  dispatch,
  Dispatchable,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { Mapper } from "./Mapper";
import { MapperMessage } from "./MapperMessage";
import { MapperState } from "./MapperState";

export const spawnMapper = <TInputSnapshot, TOutputSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  mappingFunction: (input: TInputSnapshot) => TOutputSnapshot,
  options?: {
    readonly destination?: Dispatchable<SnapshotMessage<TOutputSnapshot>>;
  }
): Mapper<TInputSnapshot, TOutputSnapshot> =>
  spawn(
    parent,
    (
      state: MapperState<TOutputSnapshot>,
      message: MapperMessage<TInputSnapshot, TOutputSnapshot>
    ): MapperState<TOutputSnapshot> => {
      switch (message.type) {
        case "set destination":
          return {
            destination: message.destination,
            isDestinationSet: true,
          };
        case "snapshot":
          if (state.isDestinationSet === false) {
            return state;
          }

          dispatch(state.destination, {
            type: "snapshot",
            snapshot: mappingFunction(message.snapshot),
          });

          return state;
      }
    },
    {
      initialState: options?.destination
        ? {
            destination: options?.destination,
            isDestinationSet: true,
          }
        : {
            isDestinationSet: false,
          },
    }
  ) as Mapper<TInputSnapshot, TOutputSnapshot>;
