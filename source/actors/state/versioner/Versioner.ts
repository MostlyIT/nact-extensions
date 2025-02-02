import { Version } from "../../../data-types/state-snapshot/Version";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { VersionerMessage } from "./VersionerMessage";

declare const versioner: unique symbol;

/**
 * An actor that relays state snapshots after branding them with the its semantic symbol and version.
 */
export type Versioner<
  TValue,
  TInputVersion extends Version<any>,
  TSemanticSymbol extends symbol
> = { [versioner]: true } & LocalActorRef<
  VersionerMessage<TValue, TInputVersion, TSemanticSymbol>
>;
