import { LocalActorRef } from "@nact/core";
import { MapperMessage } from "./MapperMessage";

declare const mapper: unique symbol;

/**
 * An actor that maps input values to output values and sends them to a specific address.
 */
export type Mapper<TInputSnapshot, TOutputSnapshot> = {
  [mapper]: true;
} & LocalActorRef<MapperMessage<TInputSnapshot, TOutputSnapshot>>;
