import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { delay } from "../../utility/__testing__/delay";
import { dispatch, spawn, start } from "../../vendored/@nact/core";
import { testRelayLike } from "../relay/__testing__/testRelayLike";
import { Distinct } from "./Distinct";
import { spawnDistinct } from "./spawnDistinct";

describe("Distinct", () => {
  describe("actor", () => {
    it("should correctly infer type from parameters", () => {
      const system = start();

      const distinct1 = spawnDistinct(
        system,
        async (prev: number, curr) => prev === curr
      );
      const distinct2 = spawnDistinct(
        system,
        async (prev, curr: number) => prev === curr
      );
      const distinct3 = spawnDistinct(
        system,
        async (prev: number, curr: number) => prev === curr
      );

      expectTypeOf(distinct1).toMatchTypeOf<Distinct<number>>();
      expectTypeOf(distinct2).toMatchTypeOf<Distinct<number>>();
      expectTypeOf(distinct3).toMatchTypeOf<Distinct<number>>();
    });
  });

  testRelayLike(
    (parent, options?) =>
      spawnDistinct(
        parent,
        async (previous, current) => previous === current,
        options
      ),
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: 1000,
      }),
    1000,
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: 314,
      }),
    314,
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: 1,
      }),
    1
  );

  describe("distinct-filtering", () => {
    it("should relay inputted snapshots if unique", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const distinct = spawnDistinct(
        system,
        async (previous, current) => previous === current,
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
        async (previous, current) => previous === current,
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

    it("should accept async function input", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const distinct = spawnDistinct(
        system,
        async (previous, current) => {
          await delay(2);
          return previous === current;
        },
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
  });
});
