export const ownKeys = <
  TInputObject extends {
    readonly [key: string | symbol]: any;
  }
>(
  object: TInputObject
): readonly (keyof TInputObject)[] =>
  Reflect.ownKeys(object) as (keyof TInputObject)[];
