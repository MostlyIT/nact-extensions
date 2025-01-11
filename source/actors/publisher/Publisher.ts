import { LocalActorRef } from "@nact/core";
import { PublisherMessage } from "./PublisherMessage";

declare const publisher: unique symbol;

/**
 * An actor that manages a subscriber list and publishes snapshot messages sent to it to its subscribers.
 */
export type Publisher<TSnapshot> = { [publisher]: true } & LocalActorRef<
  PublisherMessage<TSnapshot>
>;
