import { LocalActorRef } from "@nact/core";
import { PublisherMessage } from "./PublisherMessage";

declare const publisher: unique symbol;

/**
 * An actor that manages a subscriber list to which it publishes snapshot messages on command.
 */
export type Publisher<TSnapshot> = { [publisher]: true } & LocalActorRef<
  PublisherMessage<TSnapshot>
>;
