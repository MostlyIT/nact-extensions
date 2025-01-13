import { Relay } from "../relay/Relay";

export type DistinctState<TSnapshot> = {
  readonly relay: Relay<TSnapshot>;
} & (
  | {
      readonly hasSeenSnapshot: true;
      readonly previousSnapshot: TSnapshot;
    }
  | {
      readonly hasSeenSnapshot: false;
    }
);
