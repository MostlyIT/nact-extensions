import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { PublisherOptions } from "../../publisher/PublisherOptions";

export type OpenAuthorityOptions<
  TValue,
  TSemanticSymbol extends symbol
> = PublisherOptions<
  StateSnapshot<TValue, Version<TSemanticSymbol>, TSemanticSymbol>
>;
