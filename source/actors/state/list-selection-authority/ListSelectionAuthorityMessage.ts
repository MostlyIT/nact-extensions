import { List } from "immutable";
import { SelectValueMessage } from "../../../data-types/messages/SelectValueMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import {
  KeyOfVersion,
  Version,
} from "../../../data-types/state-snapshot/Version";

export type ListSelectionAuthorityMessage<
  TListValue,
  TListVersion extends Version<any>,
  TListSemanticSymbol extends symbol,
  TSemanticSymbol extends symbol
> =
  | SnapshotMessage<
      StateSnapshot<List<TListValue> | null, TListVersion, TListSemanticSymbol>
    >
  | SelectValueMessage<TListValue | null>
  | SubscribeMessage<
      StateSnapshot<
        TListValue | null,
        Version<KeyOfVersion<TListVersion> | TSemanticSymbol>,
        TSemanticSymbol
      >
    >
  | UnsubscribeMessage<
      StateSnapshot<
        TListValue | null,
        Version<KeyOfVersion<TListVersion> | TSemanticSymbol>,
        TSemanticSymbol
      >
    >;
