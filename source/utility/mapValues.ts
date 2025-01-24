import { ownKeys } from "./ownKeys";

export const mapValues = <
  TInputObject extends {
    readonly [key: string | symbol]: any;
  },
  TOutputValue
>(
  object: TInputObject,
  valueMapper: (
    value: TInputObject[keyof TInputObject],
    key: Exclude<keyof TInputObject, number>,
    object: TInputObject
  ) => TOutputValue
): {
  readonly [key in Exclude<keyof TInputObject, number>]: TOutputValue;
} =>
  Object.fromEntries(
    ownKeys(object).map((key) => [key, valueMapper(object[key], key, object)])
  ) as {
    [key in Exclude<keyof TInputObject, number>]: TOutputValue;
  };
