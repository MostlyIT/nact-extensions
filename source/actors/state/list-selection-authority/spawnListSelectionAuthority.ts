import { List } from "immutable";
import { SelectValueMessage } from "../../../data-types/messages/SelectValueMessage";
import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { ownValues } from "../../../utility";
import {
  LocalActorRef,
  LocalActorSystemRef,
} from "../../../vendored/@nact/core";
import { spawnEventAuthority } from "../event-authority/spawnEventAuthority";
import { ListSelectionAuthority } from "./ListSelectionAuthority";
import { ListSelectionAuthorityOptions } from "./ListSelectionAuthorityOptions";
import { ListSelectionAuthorityState } from "./ListSelectionAuthorityState";

export const spawnListSelectionAuthority = <
  TListValue,
  TListVersion extends Version<any>,
  TListSemanticSymbol extends symbol,
  TSemanticSymbol extends symbol
>(
  parent: LocalActorSystemRef | LocalActorRef<any>,
  semanticSymbol: TSemanticSymbol,
  listAuthorityObject: {
    readonly [key in TListSemanticSymbol]: LocalActorRef<
      SubscriptionMessage<
        StateSnapshot<
          List<TListValue> | null,
          TListVersion,
          TListSemanticSymbol
        >
      >
    >;
  },
  options?: ListSelectionAuthorityOptions<
    TListValue,
    TListVersion,
    TListSemanticSymbol,
    TSemanticSymbol
  >
): ListSelectionAuthority<
  TListValue,
  TListVersion,
  TListSemanticSymbol,
  TSemanticSymbol
> =>
  spawnEventAuthority(
    parent,
    semanticSymbol,
    listAuthorityObject,
    async (
      _state: ListSelectionAuthorityState<TListValue>,
      message: SelectValueMessage<TListValue | null>,
      lastCombinedObject
    ) => {
      if (ownValues(lastCombinedObject).some((list) => list === null)) {
        return {
          selectedValue: null,
        } satisfies ListSelectionAuthorityState<TListValue>;
      }

      // List to select from exists.

      if (message.value === null) {
        return {
          selectedValue: null,
        } satisfies ListSelectionAuthorityState<TListValue>;
      }

      // Value candidate is not null.

      if (
        !ownValues(lastCombinedObject).every((list) =>
          list!.includes(message.value!)
        )
      ) {
        return {
          selectedValue: null,
        } satisfies ListSelectionAuthorityState<TListValue>;
      }

      // Value candidate is in list to select from.

      return {
        selectedValue: message.value,
      } satisfies ListSelectionAuthorityState<TListValue>;
    },
    async (state, newCombinedObject) => {
      if (state === undefined) {
        return {
          selectedValue: null,
        } satisfies ListSelectionAuthorityState<TListValue>;
      }

      // State is initialized and value could have been selected previously.

      if (state.selectedValue === null) {
        return state;
      }

      // Value was previously selected.

      if (ownValues(newCombinedObject).some((list) => list === null)) {
        return {
          selectedValue: null,
        } satisfies ListSelectionAuthorityState<TListValue>;
      }

      // List to select from exists.

      if (
        !ownValues(newCombinedObject).every((list) =>
          list!.includes(state.selectedValue!)
        )
      ) {
        return {
          selectedValue: null,
        } satisfies ListSelectionAuthorityState<TListValue>;
      }

      // Previously selected value is in new list.

      return state;
    },
    async (state, _lastCombinedObject) => state.selectedValue,
    async (previous, current) => previous === current,
    options
  );
