import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { delay } from "../../utility/testing/delay.test";
import { SnapshotMessage } from "./SnapshotMessage";
import { spawnPublisher } from "./spawnPublisher";

describe("publisher", () => {
  it("should publish on PublishMessage", async () => {
    const system = start();

    const publisher = spawnPublisher<number>(system);

    const consumerFunction = vi.fn();
    const consumer = spawn(system, (_state, message) =>
      consumerFunction(message)
    );

    dispatch(publisher, {
      type: "subscribe",
      subscriber: consumer,
    });

    await delay(10);
    expect(consumerFunction).not.toHaveBeenCalled();

    dispatch(publisher, {
      type: "publish snapshot",
      snapshot: 1000,
    });

    await delay(10);
    expect(consumerFunction).toHaveBeenCalledTimes(1);
    expect(consumerFunction).toHaveBeenNthCalledWith(1, {
      type: "snapshot",
      snapshot: 1000,
    } satisfies SnapshotMessage<number>);
  });

  it("should subscribe on SubscribeMessage", async () => {
    const system = start();

    const publisher = spawnPublisher<number>(system);

    const consumerFunction = vi.fn();
    const consumer = spawn(system, (_state, message) =>
      consumerFunction(message)
    );

    dispatch(publisher, {
      type: "publish snapshot",
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
      type: "publish snapshot",
      snapshot: 1000,
    });

    await delay(10);
    expect(consumerFunction).toHaveBeenCalledTimes(1);
    expect(consumerFunction).toHaveBeenNthCalledWith(1, {
      type: "snapshot",
      snapshot: 1000,
    } satisfies SnapshotMessage<number>);
  });

  it("should unsubscribe on UnsubscribeMessage", async () => {
    const system = start();

    const publisher = spawnPublisher<number>(system);

    const consumerFunction = vi.fn();
    const consumer = spawn(system, (_state, message) =>
      consumerFunction(message)
    );

    dispatch(publisher, {
      type: "subscribe",
      subscriber: consumer,
    });

    await delay(10);
    dispatch(publisher, {
      type: "publish snapshot",
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
      type: "publish snapshot",
      snapshot: 314,
    });

    await delay(10);
    expect(consumerFunction).toHaveBeenCalledTimes(1);
  });

  it("should publish to consumers every time", async () => {
    const system = start();

    const publisher = spawnPublisher<number>(system);

    const consumerFunction = vi.fn();
    const consumer = spawn(system, (_state, message) =>
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
      type: "publish snapshot",
      snapshot: 1000,
    });

    await delay(10);
    expect(consumerFunction).toHaveBeenCalledTimes(1);
    expect(consumerFunction).toHaveBeenNthCalledWith(1, {
      type: "snapshot",
      snapshot: 1000,
    } satisfies SnapshotMessage<number>);

    dispatch(publisher, {
      type: "publish snapshot",
      snapshot: 314,
    });

    await delay(10);
    expect(consumerFunction).toHaveBeenCalledTimes(2);
    expect(consumerFunction).toHaveBeenNthCalledWith(2, {
      type: "snapshot",
      snapshot: 314,
    } satisfies SnapshotMessage<number>);
  });

  it("should support having multiple subscribers", async () => {
    const system = start();

    const publisher = spawnPublisher<number>(system);

    const consumerFunction1 = vi.fn();
    const consumer1 = spawn(system, (_state, message) =>
      consumerFunction1(message)
    );

    const consumerFunction2 = vi.fn();
    const consumer2 = spawn(system, (_state, message) =>
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
      type: "publish snapshot",
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
  });

  it("should support unsubscribing when multiple consumers are subscribed", async () => {
    const system = start();

    const publisher = spawnPublisher<number>(system);

    const consumerFunction1 = vi.fn();
    const consumer1 = spawn(system, (_state, message) =>
      consumerFunction1(message)
    );

    const consumerFunction2 = vi.fn();
    const consumer2 = spawn(system, (_state, message) =>
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
      type: "publish snapshot",
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
      type: "publish snapshot",
      snapshot: 314,
    });

    await delay(10);
    expect(consumerFunction1).toHaveBeenCalledTimes(1);
    expect(consumerFunction2).toHaveBeenCalledTimes(2);
    expect(consumerFunction2).toHaveBeenNthCalledWith(2, {
      type: "snapshot",
      snapshot: 314,
    } satisfies SnapshotMessage<number>);
  });
});
