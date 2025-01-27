import { LocalActorRef } from "@nact/core";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { EventAuthorityMessage } from "./EventAuthorityMessage";

declare const eventAuthority: unique symbol;

export type EventAuthority<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> = {
  [eventAuthority]: true;
} & LocalActorRef<
  EventAuthorityMessage<
    TStateSnapshotsObject,
    TEventMessage,
    TOutputValue,
    TSemanticSymbol
  >
>;
