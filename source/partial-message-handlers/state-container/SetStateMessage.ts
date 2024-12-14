export type SetStateMessage<TState> = {
  readonly type: "set state";
  readonly state: TState;
};
