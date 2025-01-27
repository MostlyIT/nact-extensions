import { Version } from "../../data-types/state-snapshot/Version";
import { ownKeys } from "../ownKeys";

export const areVersionsEqual = <TVersion extends Version<any>>(
  a: TVersion,
  b: TVersion
): boolean => {
  const aKeys = ownKeys(a);
  const bKeys = ownKeys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((aKey) => a[aKey] === b[aKey]);
};
