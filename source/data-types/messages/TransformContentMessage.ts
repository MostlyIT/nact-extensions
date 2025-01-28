export type TransformContentMessage<TValue> = {
  readonly type: "transform content";
  readonly transformer: (value: TValue) => TValue;
};
