import { LocalActorRef } from "@nact/core";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { DerivedAuthorityMessage } from "./DerivedAuthorityMessage";

declare const derivedAuthority: unique symbol;

export type DerivedAuthority<
  TStateSnapshotsObject extends {
    readonly [key: symbol]: StateSnapshot<any, any, any>;
  },
  TOutputValue,
  TSemanticSymbol extends symbol
> = {
  [derivedAuthority]: true;
} & LocalActorRef<
  DerivedAuthorityMessage<TStateSnapshotsObject, TOutputValue, TSemanticSymbol>
>;
