import { List } from "immutable";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { EventAuthorityOptions } from "../event-authority/EventAuthorityOptions";

export type ListSelectionAuthorityOptions<
  TListValue,
  TListVersion extends Version<any>,
  TListSemanticSymbol extends symbol,
  TSemanticSymbol extends symbol
> = EventAuthorityOptions<
  {
    readonly [key in TListSemanticSymbol]: StateSnapshot<
      List<TListValue> | null,
      TListVersion,
      TListSemanticSymbol
    >;
  },
  TListValue | null,
  TSemanticSymbol
>;
