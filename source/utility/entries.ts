import { ownKeys } from "./ownKeys";

export const entries = <
  TInputObject extends {
    readonly [key in keyof TInputObject]: any;
  }
>(
  object: TInputObject
): readonly (readonly [
  Exclude<keyof TInputObject, number>,
  TInputObject[keyof TInputObject]
])[] => ownKeys(object).map((key) => [key, object[key]]);
