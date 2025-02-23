import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { EventAuthorityMessage } from "./EventAuthorityMessage";

/**
 * An actor responsible for a specific piece of application state whose value can be dependent on other authorities, but can also be changed directly through events.
 */
export type EventAuthority<
  TStateSnapshotsObject extends {
    readonly [key in symbol]: StateSnapshot<any, any, key>;
  },
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> = LocalActorRef<
  EventAuthorityMessage<
    TStateSnapshotsObject,
    TEventMessage,
    TOutputValue,
    TSemanticSymbol
  >
>;
