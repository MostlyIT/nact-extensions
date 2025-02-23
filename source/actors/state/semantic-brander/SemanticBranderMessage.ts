import { DestinationMessage } from "../../../data-types/messages/DestinationMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";

export type SemanticBranderMessage<
  TValue,
  TInputVersion extends Version<any>,
  TSemanticSymbol extends symbol
> =
  | DestinationMessage<StateSnapshot<TValue, TInputVersion, TSemanticSymbol>>
  | SnapshotMessage<StateSnapshot<TValue, TInputVersion, symbol | undefined>>;
