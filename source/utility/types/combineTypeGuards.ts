import { TypeGuard, TypeOfTypeGuard } from "./TypeGuard";

export const combineTypeGuards =
  <
    TTypeGuardsObject extends {
      readonly [key: string]: TypeGuard<any>;
    }
  >(
    typeGuardsObject: TTypeGuardsObject
  ): TypeGuard<TypeOfTypeGuard<TTypeGuardsObject[keyof TTypeGuardsObject]>> =>
  (
    candidate: any
  ): candidate is TypeOfTypeGuard<
    TTypeGuardsObject[keyof TTypeGuardsObject]
  > => {
    for (const typeGuard of Object.values(typeGuardsObject)) {
      if (typeGuard(candidate)) {
        return true;
      }
    }

    return false;
  };
