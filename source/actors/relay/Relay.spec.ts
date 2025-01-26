import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { delay } from "../../utility/__testing__/delay";
import { testRelayLike } from "./__testing__/testRelayLike";
import { Relay } from "./Relay";
import { spawnRelay } from "./spawnRelay";

describe("Relay", () => {
  // @ts-expect-error
  testRelayLike<Relay<number>, number>(
    spawnRelay,
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

  describe("relaying", () => {
    it("should relay inputted snapshot messages", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const relay = spawnRelay(system, {
        initialDestination: consumer,
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(relay, {
        type: "snapshot",
        snapshot: 1000,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: 1000,
      } satisfies SnapshotMessage<number>);

      dispatch(relay, {
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
