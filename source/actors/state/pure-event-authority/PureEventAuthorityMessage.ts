import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";

export type PureEventAuthorityMessage<
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> =
  | TEventMessage
  | SubscriptionMessage<
      StateSnapshot<TOutputValue, Version<TSemanticSymbol>, TSemanticSymbol>
    >;
