import { LocalActorRef } from "@nact/core";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
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

// Basic

export type ValueOfVersioner<TVersioner extends Versioner<any, any, any>> =
  TVersioner extends Versioner<infer TValue, any, any> ? TValue : never;

export type InputVersionOfVersioner<
  TVersioner extends Versioner<any, any, any>
> = TVersioner extends Versioner<any, infer TInputVersion, any>
  ? TInputVersion
  : never;

export type SemanticSymbolOfVersioner<
  TVersioner extends Versioner<any, any, any>
> = TVersioner extends Versioner<any, any, infer TSemanticSymbol>
  ? TSemanticSymbol
  : never;

// Derived

export type InputSnapshotMessageOfVersioner<
  TVersioner extends Versioner<any, any, any>
> = SnapshotMessage<InputStateSnapshotOfVersioner<TVersioner>>;

export type InputStateSnapshotOfVersioner<
  TVersioner extends Versioner<any, any, any>
> = StateSnapshot<
  ValueOfVersioner<TVersioner>,
  InputVersionOfVersioner<TVersioner>,
  symbol | undefined
>;

export type OutputSnapshotMessageOfVersioner<
  TVersioner extends Versioner<any, any, any>
> = SnapshotMessage<OutputStateSnapshotOfVersioner<TVersioner>>;

export type OutputStateSnapshotOfVersioner<
  TVersioner extends Versioner<any, any, any>
> = StateSnapshot<
  ValueOfVersioner<TVersioner>,
  InputVersionOfVersioner<TVersioner> & {
    readonly [key in SemanticSymbolOfVersioner<TVersioner>]: number;
  },
  SemanticSymbolOfVersioner<TVersioner>
>;
