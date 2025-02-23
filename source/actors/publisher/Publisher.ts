import { LocalActorRef } from "../../vendored/@nact/core";
import { PublisherMessage } from "./PublisherMessage";

/**
 * An actor that manages a subscriber list and publishes snapshot messages sent to it to its subscribers.
 */
export type Publisher<TSnapshot> = LocalActorRef<PublisherMessage<TSnapshot>>;
