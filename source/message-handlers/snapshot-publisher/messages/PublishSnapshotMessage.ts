export type PublishSnapshotMessage<TSnapshot> = {
  readonly type: "publish snapshot";
  readonly snapshot: TSnapshot;
};

export const isPublishSnapshotMessage__unsafe = <TSnapshot>(
  message: any
): message is PublishSnapshotMessage<TSnapshot> => {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  if (!("type" in message)) {
    return false;
  }

  if (message.type !== "publish snapshot") {
    return false;
  }

  if (!("snapshot" in message)) {
    return false;
  }

  return true;
};
