export type PartialMessageHandler<
  TInMessage,
  TOutMessage,
  TThroughMessage,
  TState
> = (
  state: TState,
  message: TInMessage | TThroughMessage
) => {
  readonly state: TState;
  readonly messages: readonly [TThroughMessage] | readonly TOutMessage[];
};

export type InMessageOfPartialMessageHandler<
  TPartialMessageHandler extends PartialMessageHandler<any, any, any, any>
> = TPartialMessageHandler extends PartialMessageHandler<
  infer TInMessage,
  any,
  any,
  any
>
  ? TInMessage
  : never;

export type OutMessageOfPartialMessageHandler<
  TPartialMessageHandler extends PartialMessageHandler<any, any, any, any>
> = TPartialMessageHandler extends PartialMessageHandler<
  any,
  infer TOutMessage,
  any,
  any
>
  ? TOutMessage
  : never;

export type ThroughMessageOfPartialMessageHandler<
  TPartialMessageHandler extends PartialMessageHandler<any, any, any, any>
> = TPartialMessageHandler extends PartialMessageHandler<
  any,
  any,
  infer TThroughMessage,
  any
>
  ? TThroughMessage
  : never;

export type StateOfPartialMessageHandler<
  TPartialMessageHandler extends PartialMessageHandler<any, any, any, any>
> = TPartialMessageHandler extends PartialMessageHandler<
  any,
  any,
  any,
  infer TState
>
  ? TState
  : never;
