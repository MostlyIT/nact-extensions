import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "../../vendored/@nact/core";
import { Relay } from "./Relay";
import { RelayMessage } from "./RelayMessage";
import { RelayOptions } from "./RelayOptions";
import { RelayState } from "./RelayState";

export const spawnRelay = <TSnapshot>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  options?: RelayOptions<TSnapshot>
): Relay<TSnapshot> =>
  spawn(
    parent,
    (
      state: RelayState<TSnapshot>,
      message: RelayMessage<TSnapshot>
    ): RelayState<TSnapshot> => {
      switch (message.type) {
        case "set destination":
          return {
            destination: message.destination,
            isDestinationSet: true,
          };
        case "snapshot":
          if (state.isDestinationSet) {
            dispatch(state.destination, message);
          }

          return state;
        case "unset destination":
          return {
            isDestinationSet: false,
          };
      }
    },
    {
      initialState: options?.initialDestination
        ? {
            destination: options?.initialDestination,
            isDestinationSet: true,
          }
        : {
            isDestinationSet: false,
          },
    }
  ) as Relay<TSnapshot>;
