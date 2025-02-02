import { Set } from "immutable";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { delay } from "../../utility/__testing__/delay";
import {
  dispatch,
  LocalActorRef,
  spawn,
  start,
} from "../../vendored/@nact/core";
import { testPublisherLike } from "../publisher/__testing__/testPublisherLike";
import { ReplayPublisher } from "./ReplayPublisher";
import { spawnReplayPublisher } from "./spawnReplayPublisher";

describe("ReplayPublisher", () => {
  describe("actor", () => {
    it("should correctly infer type from parameters", () => {
      const system = start();

      const sink: LocalActorRef<SnapshotMessage<number>> = spawn(
        system,
        (state, _message: SnapshotMessage<number>) => state
      );

      const replayPublisher = spawnReplayPublisher(system, 2, {
        initialSubscribersSet: Set([sink]),
      });

      expectTypeOf(replayPublisher).toMatchTypeOf<ReplayPublisher<number>>();
    });
  });

  testPublisherLike(
    (parent, options) => spawnReplayPublisher(parent, 0, options),
    (publisherLike) =>
      dispatch(publisherLike, {
        type: "snapshot",
        snapshot: 1000,
      }),
    1000,
    (publisherLike) =>
      dispatch(publisherLike, {
        type: "snapshot",
        snapshot: 314,
      }),
    314,
    (publisherLike) =>
      dispatch(publisherLike, {
        type: "snapshot",
        snapshot: 1,
      }),
    1
  );

  it("should replay snapshot messages to new subscribers", async () => {
    const system = start();

    const consumerFunction1 = vi.fn();
    const consumer1 = spawn(system, (_state, message) =>
      consumerFunction1(message)
    );

    const consumerFunction2 = vi.fn();
    const consumer2 = spawn(system, (_state, message) =>
      consumerFunction2(message)
    );

    const consumerFunction3 = vi.fn();
    const consumer3 = spawn(system, (_state, message) =>
      consumerFunction3(message)
    );

    const replayPublisher = spawnReplayPublisher(system, 2);

    dispatch(replayPublisher, {
      type: "snapshot",
      snapshot: 1000,
    });
    dispatch(replayPublisher, {
      type: "subscribe",
      subscriber: consumer1,
    });

    await delay(10);
    expect(consumerFunction1).toHaveBeenCalledTimes(1);
    expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
      type: "snapshot",
      snapshot: 1000,
    } satisfies SnapshotMessage<number>);
    expect(consumerFunction2).not.toHaveBeenCalled();
    expect(consumerFunction3).not.toHaveBeenCalled();

    dispatch(replayPublisher, {
      type: "snapshot",
      snapshot: 314,
    });
    dispatch(replayPublisher, {
      type: "subscribe",
      subscriber: consumer2,
    });

    await delay(10);
    expect(consumerFunction1).toHaveBeenCalledTimes(2);
    expect(consumerFunction1).toHaveBeenNthCalledWith(2, {
      type: "snapshot",
      snapshot: 314,
    } satisfies SnapshotMessage<number>);
    expect(consumerFunction2).toHaveBeenCalledTimes(2);
    expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
      type: "snapshot",
      snapshot: 1000,
    } satisfies SnapshotMessage<number>);
    expect(consumerFunction2).toHaveBeenNthCalledWith(2, {
      type: "snapshot",
      snapshot: 314,
    } satisfies SnapshotMessage<number>);
    expect(consumerFunction3).not.toHaveBeenCalled();

    dispatch(replayPublisher, {
      type: "snapshot",
      snapshot: 1,
    });
    dispatch(replayPublisher, {
      type: "subscribe",
      subscriber: consumer3,
    });

    await delay(10);
    expect(consumerFunction1).toHaveBeenCalledTimes(3);
    expect(consumerFunction1).toHaveBeenNthCalledWith(3, {
      type: "snapshot",
      snapshot: 1,
    } satisfies SnapshotMessage<number>);
    expect(consumerFunction2).toHaveBeenCalledTimes(3);
    expect(consumerFunction2).toHaveBeenNthCalledWith(3, {
      type: "snapshot",
      snapshot: 1,
    } satisfies SnapshotMessage<number>);
    expect(consumerFunction3).toHaveBeenCalledTimes(2);
    expect(consumerFunction3).toHaveBeenNthCalledWith(1, {
      type: "snapshot",
      snapshot: 314,
    } satisfies SnapshotMessage<number>);
    expect(consumerFunction3).toHaveBeenNthCalledWith(2, {
      type: "snapshot",
      snapshot: 1,
    } satisfies SnapshotMessage<number>);
  });
});
