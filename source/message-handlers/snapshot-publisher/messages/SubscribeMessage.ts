import { Dispatchable } from "@nact/core";
import { SnapshotMessage } from "./SnapshotMessage";

export type SubscribeMessage<TSnapshot> = {
  readonly type: "subscribe";
  readonly subscriber: Dispatchable<SnapshotMessage<TSnapshot>>;
};

export const isSubscribeMessage__unsafe = <TSnapshot>(
  message: any
): message is SubscribeMessage<TSnapshot> => {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  if (!("type" in message)) {
    return false;
  }

  if (message.type !== "subscribe") {
    return false;
  }

  if (!("subscriber" in message)) {
    return false;
  }

  return true;
};
