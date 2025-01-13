import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { expect, vi } from "vitest";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { delay } from "../../../utility/__testing__/delay";
import { ReplayPublisherMessage } from "../ReplayPublisherMessage";

export const shouldReplayMessagesToNewSubscribersTestCase = async (
  parent: LocalActorSystemRef | LocalActorRef<any>,
  replayPublisher: LocalActorRef<ReplayPublisherMessage<number>>
) => {
  const consumerFunction = vi.fn();
  const consumer = spawn(parent, (_state, message) =>
    consumerFunction(message)
  );

  dispatch(replayPublisher, {
    type: "subscribe",
    subscriber: consumer,
  });

  await delay(10);
  expect(consumerFunction).not.toHaveBeenCalled();

  dispatch(replayPublisher, {
    type: "unsubscribe",
    subscriber: consumer,
  });

  await delay(10);
  dispatch(replayPublisher, {
    type: "snapshot",
    snapshot: 1000,
  });

  await delay(10);
  dispatch(replayPublisher, {
    type: "subscribe",
    subscriber: consumer,
  });

  await delay(10);
  expect(consumerFunction).toHaveBeenCalledTimes(1);
  expect(consumerFunction).toHaveBeenNthCalledWith(1, {
    type: "snapshot",
    snapshot: 1000,
  } satisfies SnapshotMessage<number>);

  dispatch(replayPublisher, {
    type: "unsubscribe",
    subscriber: consumer,
  });

  await delay(10);
  dispatch(replayPublisher, {
    type: "snapshot",
    snapshot: 314,
  });

  await delay(10);
  dispatch(replayPublisher, {
    type: "subscribe",
    subscriber: consumer,
  });

  await delay(10);
  expect(consumerFunction).toHaveBeenCalledTimes(3);
  expect(consumerFunction).toHaveBeenNthCalledWith(2, {
    type: "snapshot",
    snapshot: 1000,
  } satisfies SnapshotMessage<number>);
  expect(consumerFunction).toHaveBeenNthCalledWith(3, {
    type: "snapshot",
    snapshot: 314,
  } satisfies SnapshotMessage<number>);

  dispatch(replayPublisher, {
    type: "unsubscribe",
    subscriber: consumer,
  });

  await delay(10);
  dispatch(replayPublisher, {
    type: "snapshot",
    snapshot: 1,
  });

  await delay(10);
  dispatch(replayPublisher, {
    type: "subscribe",
    subscriber: consumer,
  });

  await delay(10);
  expect(consumerFunction).toHaveBeenCalledTimes(5);
  expect(consumerFunction).toHaveBeenNthCalledWith(4, {
    type: "snapshot",
    snapshot: 314,
  } satisfies SnapshotMessage<number>);
  expect(consumerFunction).toHaveBeenNthCalledWith(5, {
    type: "snapshot",
    snapshot: 1,
  } satisfies SnapshotMessage<number>);
};
