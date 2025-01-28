export type ReplaceContentMessage<TValue> = {
  readonly type: "replace content";
  readonly value: TValue;
};
