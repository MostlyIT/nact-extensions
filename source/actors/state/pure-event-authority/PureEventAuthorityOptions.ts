import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { PublisherOptions } from "../../publisher/PublisherOptions";

export type PureEventAuthorityOptions<
  TOutputValue,
  TSemanticSymbol extends symbol
> = PublisherOptions<
  StateSnapshot<TOutputValue, Version<TSemanticSymbol>, TSemanticSymbol>
>;
