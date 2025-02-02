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
import { testPublisherLike } from "./__testing__/testPublisherLike";
import { Publisher } from "./Publisher";
import { spawnPublisher } from "./spawnPublisher";

describe("Publisher", () => {
  describe("actor", () => {
    it("should correctly infer type from parameters", () => {
      const system = start();

      const sink: LocalActorRef<SnapshotMessage<number>> = spawn(
        system,
        (state, _message: SnapshotMessage<number>) => state
      );

      const publisher = spawnPublisher(system, {
        initialSubscribersSet: Set([sink]),
      });

      expectTypeOf(publisher).toMatchTypeOf<Publisher<number>>();
    });
  });

  testPublisherLike(
    spawnPublisher,
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

  describe("publishing", () => {
    it("should publish inputted snapshot messages", async () => {
      const system = start();

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      const publisher = spawnPublisher(system, {
        initialSubscribersSet: Set([consumer1, consumer2]),
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
        type: "snapshot",
        snapshot: 314,
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(2);
      expect(consumerFunction1).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: 314,
      } satisfies SnapshotMessage<number>);
      expect(consumerFunction2).toHaveBeenCalledTimes(2);
      expect(consumerFunction2).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: 314,
      } satisfies SnapshotMessage<number>);
    });
  });
});
