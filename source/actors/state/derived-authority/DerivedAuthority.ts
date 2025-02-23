import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { DerivedAuthorityMessage } from "./DerivedAuthorityMessage";

/**
 * An actor responsible for a specific piece of application state whose value is derived from other authorities.
 */
export type DerivedAuthority<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol
> = LocalActorRef<
  DerivedAuthorityMessage<TStateSnapshotsObject, TOutputValue, TSemanticSymbol>
>;
