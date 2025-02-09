export type SelectValueMessage<TValue> = {
  readonly type: "select value";
  readonly value: TValue;
};
