export type PublishSnapshotMessage<TSnapshot> = {
  readonly type: "publish snapshot";
  readonly snapshot: TSnapshot;
};
