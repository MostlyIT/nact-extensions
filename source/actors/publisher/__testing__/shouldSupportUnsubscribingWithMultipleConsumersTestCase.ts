import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { expect, vi } from "vitest";
import { SnapshotMessage } from "../../../messages/SnapshotMessage";
import { delay } from "../../../utility/__testing__/delay";
import { PublisherMessage } from "../PublisherMessage";

export const shouldSupportUnsubscribingWithMultipleConsumersTestCase = async (
  parent: LocalActorSystemRef | LocalActorRef<any>,
  publisher: LocalActorRef<PublisherMessage<number>>
) => {
  const consumerFunction1 = vi.fn();
  const consumer1 = spawn(parent, (_state, message) =>
    consumerFunction1(message)
  );

  const consumerFunction2 = vi.fn();
  const consumer2 = spawn(parent, (_state, message) =>
    consumerFunction2(message)
  );

  dispatch(publisher, {
    type: "subscribe",
    subscriber: consumer1,
  });
  dispatch(publisher, {
    type: "subscribe",
    subscriber: consumer2,
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

  dispatch(publisher, {
    type: "unsubscribe",
    subscriber: consumer1,
  });

  await delay(10);
  dispatch(publisher, {
    type: "snapshot",
    snapshot: 314,
  });

  await delay(10);
  expect(consumerFunction1).toHaveBeenCalledTimes(1);
  expect(consumerFunction2).toHaveBeenCalledTimes(2);
  expect(consumerFunction2).toHaveBeenNthCalledWith(2, {
    type: "snapshot",
    snapshot: 314,
  } satisfies SnapshotMessage<number>);
};
