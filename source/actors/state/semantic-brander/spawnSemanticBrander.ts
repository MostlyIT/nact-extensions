import { Version } from "../../../data-types/state-snapshot/Version";
import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "../../../vendored/@nact/core";
import { spawnRelay } from "../../relay/spawnRelay";
import { SemanticBrander } from "./SemanticBrander";
import { SemanticBranderMessage } from "./SemanticBranderMessage";
import { SemanticBranderOptions } from "./SemanticBranderOptions";
import { SemanticBranderState } from "./SemanticBranderState";

export const spawnSemanticBrander = <
  TValue,
  TVersion extends Version<any>,
  TSemanticSymbol extends symbol
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  options?: SemanticBranderOptions<TValue, TVersion, TSemanticSymbol>
): SemanticBrander<TValue, TVersion, TSemanticSymbol> =>
  spawn(
    parent,
    (
      state: SemanticBranderState<TValue, TVersion, TSemanticSymbol>,
      message: SemanticBranderMessage<TValue, TVersion, TSemanticSymbol>
    ): SemanticBranderState<TValue, TVersion, TSemanticSymbol> => {
      switch (message.type) {
        case "snapshot":
          dispatch(state.relay, {
            type: "snapshot",
            snapshot: {
              ...message.snapshot,
              semanticSymbol: semanticSymbol,
            },
          });

          return state;
        case "set destination":
        case "unset destination":
          dispatch(state.relay, message);

          return state;
      }
    },
    {
      initialStateFunc: (context) => ({
        relay: spawnRelay(context.self, options),
      }),
    }
  ) as SemanticBrander<TValue, TVersion, TSemanticSymbol>;
