import {
  dispatch,
  Dispatchable,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
  start,
} from "@nact/core";
import { Set } from "immutable";
import { expect, vi } from "vitest";
import { SnapshotMessage } from "../../../messages/SnapshotMessage";
import { delay } from "../../../utility/__testing__/delay";
import { PublisherMessage } from "../PublisherMessage";
import { PublisherOptions } from "../PublisherOptions";

export const shouldSupportInitialSubscribersSet = async (
  publisherFactory: (
    parent: LocalActorSystemRef | LocalActorRef<any>,
    options?: PublisherOptions<number>
  ) => LocalActorRef<PublisherMessage<number>>
) => {
  const system = start();

  const consumerFunction1 = vi.fn();
  const consumer1 = spawn(system, (_state, message) =>
    consumerFunction1(message)
  );

  const consumerFunction2 = vi.fn();
  const consumer2 = spawn(system, (_state, message) =>
    consumerFunction2(message)
  );

  const publisher = publisherFactory(system, {
    initialSubscribersSet: Set<Dispatchable<SnapshotMessage<number>>>([
      consumer1,
      consumer2,
    ]),
  });

  await delay(10);
  expect(consumerFunction1).not.toHaveBeenCalled();
  expect(consumerFunction2).not.toHaveBeenCalled();

  dispatch(publisher, {
    type: "snapshot",
    snapshot: 1000,
  });

  await delay(10);
  expect(consumerFunction1).toHaveBeenCalledTimes(1);
  expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
    type: "snapshot",
    snapshot: 1000,
  } satisfies SnapshotMessage<number>);
  expect(consumerFunction2).toHaveBeenCalledTimes(1);
  expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
    type: "snapshot",
    snapshot: 1000,
  } satisfies SnapshotMessage<number>);
};
