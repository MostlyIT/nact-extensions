import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";

export type PureEventAuthorityMessage<
  TEventMessage,
  TOutputValue,
  TSemanticSymbol extends symbol
> =
  | TEventMessage
  | SubscribeMessage<
      StateSnapshot<TOutputValue, Version<TSemanticSymbol>, TSemanticSymbol>
    >
  | UnsubscribeMessage<
      StateSnapshot<TOutputValue, Version<TSemanticSymbol>, TSemanticSymbol>
    >;
