import { ReplaceContentMessage } from "../../../data-types/messages/ReplaceContentMessage";
import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import { TransformContentMessage } from "../../../data-types/messages/TransformContentMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";

export type OpenAuthorityMessage<TValue, TSemanticSymbol extends symbol> =
  | ReplaceContentMessage<TValue>
  | SubscriptionMessage<
      StateSnapshot<TValue, Version<TSemanticSymbol>, TSemanticSymbol>
    >
  | TransformContentMessage<TValue>;
