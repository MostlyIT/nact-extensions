export type MessageHandler<TMessage, TState> = {
  readonly handleMessage: (state: TState, message: TMessage) => TState;
  readonly isMessage: (message: any) => message is TMessage;
};

export type MessageOfMessageHandler<
  TMessageHandler extends MessageHandler<any, any>
> = TMessageHandler extends MessageHandler<infer TMessage, any>
  ? TMessage
  : never;

export type StateOfMessageHandler<
  TMessageHandler extends MessageHandler<any, any>
> = TMessageHandler extends MessageHandler<any, infer TState> ? TState : never;
