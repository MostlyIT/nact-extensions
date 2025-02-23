import { LocalActorRef } from "../../vendored/@nact/core";
import { ReplayPublisherMessage } from "./ReplayPublisherMessage";

/**
 * An actor that manages a subscriber list and publishes snapshot messages sent to it to its subscribers. It also keeps a history of a number of the last messages that it sends to new subscribers.
 */
export type ReplayPublisher<TSnapshot> = LocalActorRef<
  ReplayPublisherMessage<TSnapshot>
>;
