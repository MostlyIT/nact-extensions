import { Version } from "../../../data-types/state-snapshot/Version";
import { LocalActorRef } from "../../../vendored/@nact/core";
import { ListSelectionAuthorityMessage } from "./ListSelectionAuthorityMessage";

export type ListSelectionAuthority<
  TListValue,
  TListVersion extends Version<any>,
  TListSemanticSymbol extends symbol,
  TSemanticSymbol extends symbol
> = LocalActorRef<
  ListSelectionAuthorityMessage<
    TListValue,
    TListVersion,
    TListSemanticSymbol,
    TSemanticSymbol
  >
>;
