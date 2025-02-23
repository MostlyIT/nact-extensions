import { LocalActorRef } from "../../vendored/@nact/core";
import { MapperMessage } from "./MapperMessage";

/**
 * An actor that maps input values to output values and sends them to a specific address.
 */
export type Mapper<TInputSnapshot, TOutputSnapshot> = LocalActorRef<
  MapperMessage<TInputSnapshot, TOutputSnapshot>
>;
