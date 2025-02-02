import { LocalActorRef } from "../../vendored/@nact/core";
import { DistinctMessage } from "./DistinctMessage";

declare const distinct: unique symbol;

/**
 * An actor that relays snapshots it gets to a customizable destination as long as they fulfill a condition.
 */
export type Distinct<TSnapshot> = {
  [distinct]: true;
} & LocalActorRef<DistinctMessage<TSnapshot>>;
