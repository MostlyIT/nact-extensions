export type SnapshotMessage<TSnapshot> = {
  readonly type: "snapshot";
  readonly snapshot: TSnapshot;
};
