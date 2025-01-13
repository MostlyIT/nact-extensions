import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
} from "@nact/core";
import { expect, vi } from "vitest";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { delay } from "../../../utility/__testing__/delay";
import { PublisherMessage } from "../PublisherMessage";

export const shouldSupportPublishingTestCase = async (
  parent: LocalActorSystemRef | LocalActorRef<any>,
  publisher: LocalActorRef<PublisherMessage<number>>
) => {
  const consumerFunction = vi.fn();
  const consumer = spawn(parent, (_state, message) =>
    consumerFunction(message)
  );

  dispatch(publisher, {
    type: "subscribe",
    subscriber: consumer,
  });

  await delay(10);
  expect(consumerFunction).not.toHaveBeenCalled();

  dispatch(publisher, {
    type: "snapshot",
    snapshot: 1000,
  });

  await delay(10);
  expect(consumerFunction).toHaveBeenCalledTimes(1);
  expect(consumerFunction).toHaveBeenNthCalledWith(1, {
    type: "snapshot",
    snapshot: 1000,
  } satisfies SnapshotMessage<number>);
};
