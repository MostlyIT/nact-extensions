import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { SemanticBranderMessage } from "./SemanticBranderMessage";

declare const semanticBrander: unique symbol;

/**
 * An actor that relays state snapshots after branding them with its semantic symbol.
 */
export type SemanticBrander<
  TValue,
  TVersion extends Version<any>,
  TSemanticSymbol extends symbol
> = { [semanticBrander]: true } & LocalActorRef<
  SemanticBranderMessage<TValue, TVersion, TSemanticSymbol>
>;

// Basic

export type ValueOfSemanticBrander<
  TSemanticBrander extends SemanticBrander<any, any, any>
> = TSemanticBrander extends SemanticBrander<infer TValue, any, any>
  ? TValue
  : never;

export type VersionOfSemanticBrander<
  TSemanticBrander extends SemanticBrander<any, any, any>
> = TSemanticBrander extends SemanticBrander<any, infer TInputVersion, any>
  ? TInputVersion
  : never;

export type SemanticSymbolOfSemanticBrander<
  TSemanticBrander extends SemanticBrander<any, any, any>
> = TSemanticBrander extends SemanticBrander<any, any, infer TSemanticSymbol>
  ? TSemanticSymbol
  : never;

// Derived

export type InputSnapshotMessageOfSemanticBrander<
  TSemanticBrander extends SemanticBrander<any, any, any>
> = SnapshotMessage<InputStateSnapshotOfSemanticBrander<TSemanticBrander>>;

export type InputStateSnapshotOfSemanticBrander<
  TSemanticBrander extends SemanticBrander<any, any, any>
> = StateSnapshot<
  ValueOfSemanticBrander<TSemanticBrander>,
  VersionOfSemanticBrander<TSemanticBrander>,
  symbol | undefined
>;

export type OutputSnapshotMessageOfSemanticBrander<
  TSemanticBrander extends SemanticBrander<any, any, any>
> = SnapshotMessage<OutputStateSnapshotOfSemanticBrander<TSemanticBrander>>;

export type OutputStateSnapshotOfSemanticBrander<
  TSemanticBrander extends SemanticBrander<any, any, any>
> = StateSnapshot<
  ValueOfSemanticBrander<TSemanticBrander>,
  VersionOfSemanticBrander<TSemanticBrander>,
  SemanticSymbolOfSemanticBrander<TSemanticBrander>
>;
