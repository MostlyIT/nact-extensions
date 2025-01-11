import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
  start,
} from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { SnapshotMessage } from "../../messages/SnapshotMessage";
import { delay } from "../../utility/testing/delay.test";
import { PublisherMessage } from "./PublisherMessage";
import { spawnPublisher } from "./spawnPublisher";

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

export const shouldPublishToConsumersEveryTimeTestCase = async (
  parent: LocalActorSystemRef | LocalActorRef<any>,
  publisher: LocalActorRef<PublisherMessage<number>>
) => {
  const consumerFunction = vi.fn();
  const consumer = spawn(parent, (_state, message) =>
    consumerFunction(message)
  );

  await delay(10);
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

  dispatch(publisher, {
    type: "snapshot",
    snapshot: 314,
  });

  await delay(10);
  expect(consumerFunction).toHaveBeenCalledTimes(2);
  expect(consumerFunction).toHaveBeenNthCalledWith(2, {
    type: "snapshot",
    snapshot: 314,
  } satisfies SnapshotMessage<number>);
};

export const shouldSupportSubscribingConsumerTestCase = async (
  parent: LocalActorSystemRef | LocalActorRef<any>,
  publisher: LocalActorRef<PublisherMessage<number>>
) => {
  const consumerFunction = vi.fn();
  const consumer = spawn(parent, (_state, message) =>
    consumerFunction(message)
  );

  dispatch(publisher, {
    type: "snapshot",
    snapshot: 1000,
  });

  await delay(10);
  expect(consumerFunction).not.toHaveBeenCalled();

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

export const shouldSupportMultipleSubscribersTestCase = async (
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
};

export const shouldSupportUnsubscribingConsumerTestCase = async (
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

  dispatch(publisher, {
    type: "unsubscribe",
    subscriber: consumer,
  });

  await delay(10);
  dispatch(publisher, {
    type: "snapshot",
    snapshot: 314,
  });

  await delay(10);
  expect(consumerFunction).toHaveBeenCalledTimes(1);
};

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

describe("spawnPublisher", () => {
  describe("publishing", () => {
    it("should support publishing", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      shouldSupportPublishingTestCase(system, publisher);
    });

    it("should publish to consumers every time", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      shouldPublishToConsumersEveryTimeTestCase(system, publisher);
    });
  });

  describe("subscribing", () => {
    it("should support subscribing a consumer", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      shouldSupportSubscribingConsumerTestCase(system, publisher);
    });

    it("should support having multiple subscribers", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      shouldSupportMultipleSubscribersTestCase(system, publisher);
    });
  });

  describe("unsubscribing", () => {
    it("should support unsubscribe a consumer", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      shouldSupportUnsubscribingConsumerTestCase(system, publisher);
    });

    it("should support unsubscribing when multiple consumers are subscribed", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      shouldSupportUnsubscribingWithMultipleConsumersTestCase(
        system,
        publisher
      );
    });
  });
});
