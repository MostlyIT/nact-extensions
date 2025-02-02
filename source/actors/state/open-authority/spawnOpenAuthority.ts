import {
  LocalActorRef,
  LocalActorSystemRef,
} from "../../../vendored/@nact/core";
import { spawnPureEventAuthority } from "../pure-event-authority/spawnPureEventAuthority";
import { OpenAuthority } from "./OpenAuthority";
import { OpenAuthorityEvent } from "./OpenAuthorityEvent";
import { OpenAuthorityOptions } from "./OpenAuthorityOptions";

export const spawnOpenAuthority = <TValue, TSemanticSymbol extends symbol>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  initialValue: TValue,
  options?: OpenAuthorityOptions<TValue, TSemanticSymbol>
): OpenAuthority<TValue, TSemanticSymbol> =>
  spawnPureEventAuthority(
    parent,
    semanticSymbol,
    async (value: TValue, event: OpenAuthorityEvent<TValue>) => {
      switch (event.type) {
        case "replace content":
          return event.value;
        case "transform content":
          return event.transformer(value);
      }
    },
    async (state) => state,
    async (previous, current) => previous === current,
    initialValue,
    options
  ) as unknown as OpenAuthority<TValue, TSemanticSymbol>;
