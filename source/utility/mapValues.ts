export const mapValues = <
  TInputObject extends {
    readonly [key: string | symbol]: any;
  },
  TOutputValue
>(
  object: TInputObject,
  valueMapper: (
    value: TInputObject[keyof TInputObject],
    key: keyof TInputObject,
    object: TInputObject
  ) => TOutputValue
): {
  readonly [key in keyof TInputObject]: TOutputValue;
} =>
  Object.fromEntries(
    Reflect.ownKeys(object).map((key) => [
      key,
      valueMapper(object[key], key, object),
    ])
  ) as {
    [key in keyof TInputObject]: TOutputValue;
  };
