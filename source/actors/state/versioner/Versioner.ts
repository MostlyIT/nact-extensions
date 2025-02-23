import { Version } from "../../../data-types/state-snapshot/Version";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { VersionerMessage } from "./VersionerMessage";

/**
 * An actor that relays state snapshots after branding them with the its semantic symbol and version.
 */
export type Versioner<
  TValue,
  TInputVersion extends Version<any>,
  TSemanticSymbol extends symbol
> = LocalActorRef<VersionerMessage<TValue, TInputVersion, TSemanticSymbol>>;
