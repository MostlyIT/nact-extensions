import { ReplaceContentMessage } from "../../../data-types/messages/ReplaceContentMessage";
import { TransformContentMessage } from "../../../data-types/messages/TransformContentMessage";

export type OpenAuthorityEvent<TValue> =
  | ReplaceContentMessage<TValue>
  | TransformContentMessage<TValue>;
