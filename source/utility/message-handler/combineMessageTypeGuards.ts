import { TypeGuard, TypeOfTypeGuard } from "../types/TypeGuard";

export const combineMessageTypeGuards =
  <
    TMessageTypeGuardsObject extends {
      readonly [key: string]: TypeGuard<any>;
    }
  >(
    messageTypeGuardsObject: TMessageTypeGuardsObject
  ): TypeGuard<
    TypeOfTypeGuard<TMessageTypeGuardsObject[keyof TMessageTypeGuardsObject]>
  > =>
  (
    candidate: any
  ): candidate is TypeOfTypeGuard<
    TMessageTypeGuardsObject[keyof TMessageTypeGuardsObject]
  > => {
    for (const typeGuard of Object.values(messageTypeGuardsObject)) {
      if (typeGuard(candidate)) {
        return true;
      }
    }

    return false;
  };
