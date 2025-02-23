import { Dispatchable } from "../../vendored/@nact/core";
import { SnapshotMessage } from "./SnapshotMessage";

type SetDestinationMessage<TSnapshot> = {
  readonly type: "set destination";
  readonly destination: Dispatchable<SnapshotMessage<TSnapshot>>;
};

export type DestinationMessage<TSnapshot> =
  | SetDestinationMessage<TSnapshot>
  | {
      readonly type: "unset destination";
    };

export type SnapshotOfDestinationMessage<TMessage> =
  DestinationMessage<any> extends TMessage
    ? TMessage extends SetDestinationMessage<infer TSnapshot>
      ? TSnapshot
      : never
    : never;
