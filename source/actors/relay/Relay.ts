import { LocalActorRef } from "../../vendored/@nact/core";
import { RelayMessage } from "./RelayMessage";

/**
 * An actor that relays the snapshots it gets to a customizable destination.
 */
export type Relay<TSnapshot> = LocalActorRef<RelayMessage<TSnapshot>>;
