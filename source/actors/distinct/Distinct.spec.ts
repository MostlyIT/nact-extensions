import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { delay } from "../../utility/__testing__/delay";
import { spawnDistinct } from "./spawnDistinct";

describe("Relay", () => {
  describe("destination", () => {
    it("should support initial destination", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const distinct = spawnDistinct(
        system,
        (previous, current) => previous === current,
        {
          initialDestination: consumer,
        }
      );

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: 1000,
      } satisfies SnapshotMessage<number>);

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: 314,
      } satisfies SnapshotMessage<number>);
    });

    it("should support setting destination", async () => {
      const system = start();

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      const distinct = spawnDistinct(
        system,
        (previous, current) => previous === current
      );

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 1,
      });

      dispatch(distinct, {
        type: "set destination",
        destination: consumer1,
      });

      await delay(10);
      expect(consumerFunction1).not.toHaveBeenCalled();

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: 1000,
      } satisfies SnapshotMessage<number>);

      dispatch(distinct, {
        type: "set destination",
        destination: consumer2,
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).not.toHaveBeenCalled();

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 314,
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: 314,
      } satisfies SnapshotMessage<number>);
    });

    it("should support unsetting destination", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const distinct = spawnDistinct(
        system,
        (previous, current) => previous === current
      );

      dispatch(distinct, {
        type: "set destination",
        destination: consumer,
      });
      dispatch(distinct, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenCalledWith({
        type: "snapshot",
        snapshot: 1000,
      } satisfies SnapshotMessage<number>);

      dispatch(distinct, {
        type: "unset destination",
      });
      dispatch(distinct, {
        type: "snapshot",
        snapshot: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe("distinct-filtering", () => {
    it("should relay inputted snapshots if unique", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const distinct = spawnDistinct(
        system,
        (previous, current) => previous === current,
        {
          initialDestination: consumer,
        }
      );

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: 1000,
      } satisfies SnapshotMessage<number>);

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: 314,
      } satisfies SnapshotMessage<number>);
    });

    it("should not relay inputted snapshots if equal", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const distinct = spawnDistinct(
        system,
        (previous, current) => previous === current,
        {
          initialDestination: consumer,
        }
      );

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: 1000,
      } satisfies SnapshotMessage<number>);

      dispatch(distinct, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
    });
  });
});
