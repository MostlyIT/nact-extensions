export const ownKeys = <
  TInputObject extends {
    readonly [key: string | symbol]: any;
  }
>(
  object: TInputObject
): readonly Exclude<keyof TInputObject, number>[] =>
  Reflect.ownKeys(object) as Exclude<keyof TInputObject, number>[];
