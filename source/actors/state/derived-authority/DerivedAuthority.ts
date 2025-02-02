import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { DerivedAuthorityMessage } from "./DerivedAuthorityMessage";

declare const derivedAuthority: unique symbol;

/**
 * An actor responsible for a specific piece of application state whose value is derived from other authorities.
 */
export type DerivedAuthority<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol
> = {
  [derivedAuthority]: true;
} & LocalActorRef<
  DerivedAuthorityMessage<TStateSnapshotsObject, TOutputValue, TSemanticSymbol>
>;
