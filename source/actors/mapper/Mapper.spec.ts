import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { delay } from "../../utility/__testing__/delay";
import { dispatch, spawn, start } from "../../vendored/@nact/core";
import { testRelayLike } from "../relay/__testing__/testRelayLike";
import { Mapper } from "./Mapper";
import { spawnMapper } from "./spawnMapper";

describe("Mapper", () => {
  describe("actor", () => {
    it("should correctly infer type from parameters", () => {
      const system = start();

      const mapper1 = spawnMapper(system, async (input: number) =>
        input.toString()
      );
      const mapper2 = spawnMapper(system, async (_input) => 1000);

      expectTypeOf(mapper1).toMatchTypeOf<Mapper<number, string>>();
      expectTypeOf(mapper2).toMatchTypeOf<Mapper<unknown, number>>();
    });
  });

  testRelayLike(
    (parent, options?) =>
      spawnMapper(parent, async (input: number) => `${2 * input}`, options),
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: 1000,
      }),
    "2000",
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: 314,
      }),
    "628",
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: 1,
      }),
    "2"
  );

  describe("mapping", () => {
    it("should map and relay inputted snapshots", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const mapper = spawnMapper(system, async (input: number) => 2 * input, {
        initialDestination: consumer,
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(mapper, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: 2000,
      } satisfies SnapshotMessage<number>);

      dispatch(mapper, {
        type: "snapshot",
        snapshot: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: 628,
      } satisfies SnapshotMessage<number>);
    });

    it("should accept async function input", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const mapper = spawnMapper(
        system,
        async (input: number) => {
          await delay(2);
          return 2 * input;
        },
        {
          initialDestination: consumer,
        }
      );

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(mapper, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: 2000,
      } satisfies SnapshotMessage<number>);

      dispatch(mapper, {
        type: "snapshot",
        snapshot: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: 628,
      } satisfies SnapshotMessage<number>);
    });
  });
});
