import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { delay } from "../../utility/__testing__/delay";
import { testRelayLike } from "../relay/__testing__/testRelayLike";
import { Distinct } from "./Distinct";
import { spawnDistinct } from "./spawnDistinct";

describe("Distinct", () => {
  // @ts-expect-error
  testRelayLike<Distinct<number>, number>(
    (parent, options?) =>
      spawnDistinct(
        parent,
        (previous, current) => previous === current,
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
