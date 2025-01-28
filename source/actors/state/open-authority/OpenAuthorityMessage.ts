import { ReplaceContentMessage } from "../../../data-types/messages/ReplaceContentMessage";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { TransformContentMessage } from "../../../data-types/messages/TransformContentMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";

export type OpenAuthorityMessage<TValue, TSemanticSymbol extends symbol> =
  | ReplaceContentMessage<TValue>
  | SubscribeMessage<
      StateSnapshot<TValue, Version<TSemanticSymbol>, TSemanticSymbol>
    >
  | TransformContentMessage<TValue>
  | UnsubscribeMessage<
      StateSnapshot<TValue, Version<TSemanticSymbol>, TSemanticSymbol>
    >;
