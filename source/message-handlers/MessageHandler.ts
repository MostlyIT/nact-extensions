export type MessageHandler<in TMessage> = (message: TMessage) => void;
