import { LocalActorRef } from "../../vendored/@nact/core";
import { RelayMessage } from "./RelayMessage";

declare const relay: unique symbol;

/**
 * An actor that relays the snapshots it gets to a customizable destination.
 */
export type Relay<TSnapshot> = { [relay]: true } & LocalActorRef<
  RelayMessage<TSnapshot>
>;
