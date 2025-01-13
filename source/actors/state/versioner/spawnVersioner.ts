import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { spawnRelay } from "../../relay/spawnRelay";
import { Versioner } from "./Versioner";
import { VersionerMessage } from "./VersionerMessage";
import { VersionerOptions } from "./VersionerOptions";
import { VersionerState } from "./VersionerState";

export const spawnVersioner = <
  TValue,
  TInputVersion extends { readonly [key: symbol]: number },
  TSemanticSymbol extends symbol
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  options?: VersionerOptions<TValue, TInputVersion, TSemanticSymbol>
): Versioner<TValue, TInputVersion, TSemanticSymbol> =>
  spawn(
    parent,
    (
      state: VersionerState<TValue, TInputVersion, TSemanticSymbol>,
      message: VersionerMessage<TValue, TInputVersion, TSemanticSymbol>
    ): VersionerState<TValue, TInputVersion, TSemanticSymbol> => {
      switch (message.type) {
        case "snapshot":
          const versionToIssue =
            state.previouslyIssuedVersion !== undefined
              ? state.previouslyIssuedVersion + 1
              : 0;

          dispatch(state.relay, {
            type: "snapshot",
            snapshot: {
              value: message.snapshot.value,
              version: {
                ...message.snapshot.version,
                [semanticSymbol]: versionToIssue,
              },
              semanticSymbol,
            },
          });

          return {
            ...state,
            previouslyIssuedVersion: versionToIssue,
          };
        case "set destination":
        case "unset destination":
          dispatch(state.relay, message);

          return state;
      }
    },
    {
      initialStateFunc: (context) => ({
        relay: spawnRelay(context.self, options),
        previouslyIssuedVersion: undefined,
      }),
    }
  ) as Versioner<TValue, TInputVersion, TSemanticSymbol>;
