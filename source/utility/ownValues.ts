import { ownKeys } from "./ownKeys";

export const ownValues = <
  TInputObject extends {
    readonly [key: string | symbol]: any;
  }
>(
  object: TInputObject
): TInputObject[keyof TInputObject][] =>
  ownKeys(object).map((key) => object[key]);
