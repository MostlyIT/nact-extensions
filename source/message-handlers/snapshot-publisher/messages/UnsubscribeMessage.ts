import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "./SnapshotMessage";

export type UnsubscribeMessage<TSnapshot> = {
  readonly type: "unsubscribe";
  readonly subscriber: Dispatchable<SnapshotMessage<TSnapshot>>;
};

export const isUnsubscribeMessage__unsafe = <TSnapshot>(
  message: any
): message is UnsubscribeMessage<TSnapshot> => {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  if (!("type" in message)) {
    return false;
  }

  if (message.type !== "unsubscribe") {
    return false;
  }

  if (!("subscriber" in message)) {
    return false;
  }

  return true;
};
