import { Relay } from "../relay/Relay";

export type MapperState<TOutputSnapshot> = {
  readonly relay: Relay<TOutputSnapshot>;
};
