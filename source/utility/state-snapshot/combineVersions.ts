import {
  StateSnapshot,
  VersionOfStateSnapshot,
} from "../../data-types/state-snapshot/StateSnapshot";
import { KeyOfVersion, Version } from "../../data-types/state-snapshot/Version";
import { ownKeys } from "../ownKeys";

export const combineVersions = <
  TStateSnapshot extends StateSnapshot<any, any, any>
>(
  stateSnapshots: Iterable<TStateSnapshot>
):
  | {
      readonly type: "combined";
      readonly value: Version<
        KeyOfVersion<VersionOfStateSnapshot<TStateSnapshot>>
      >;
    }
  | {
      readonly type: "incompatible";
    } => {
  let versionAccumulator: Partial<VersionOfStateSnapshot<TStateSnapshot>> = {};

  for (const stateSnapshot of stateSnapshots) {
    for (const versionKey of ownKeys(stateSnapshot.version)) {
      if (!(versionKey in versionAccumulator)) {
        continue;
      }

      if (
        versionAccumulator[
          versionKey as keyof VersionOfStateSnapshot<TStateSnapshot>
        ] !== stateSnapshot.version[versionKey]
      ) {
        return {
          type: "incompatible",
        };
      }
    }

    versionAccumulator = {
      ...versionAccumulator,
      ...stateSnapshot.version,
    };
  }

  return {
    type: "combined",
    value: versionAccumulator as VersionOfStateSnapshot<TStateSnapshot>,
  };
};
