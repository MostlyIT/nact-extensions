import { describe, expect, it, vi } from "vitest";
import { DestinationMessage } from "../../../data-types/messages/DestinationMessage";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { delay } from "../../../utility/__testing__/delay";
import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
  start,
} from "../../../vendored/@nact/core";
import { RelayOptions } from "../RelayOptions";

export const testRelayLike = <
  TRelayLike extends LocalActorRef<DestinationMessage<TSnapshot>>,
  TSnapshot
>(
  relayConstructor: (
    parent: LocalActorSystemRef | LocalActorRef<any>,
    relayOptions?: RelayOptions<TSnapshot>
  ) => TRelayLike,
  causeFirstSnapshot: (relayLike: TRelayLike) => void,
  expectedFirstSnapshot: TSnapshot,
  causeSecondSnapshot: (relayLike: TRelayLike) => void,
  expectedSecondSnapshot: TSnapshot,
  causeThirdSnapshot: (relayLike: TRelayLike) => void,
  expectedThirdSnapshot: TSnapshot
) => {
  describe("destination", () => {
    it("should support initial destination", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const relayLike = relayConstructor(system, {
        initialDestination: consumer,
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      causeFirstSnapshot(relayLike);

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      } satisfies SnapshotMessage<TSnapshot>);

      causeSecondSnapshot(relayLike);

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      } satisfies SnapshotMessage<TSnapshot>);
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

      const relayLike = relayConstructor(system);

      causeFirstSnapshot(relayLike);

      dispatch(relayLike, {
        type: "set destination",
        destination: consumer1,
      } satisfies DestinationMessage<TSnapshot>);

      await delay(10);
      expect(consumerFunction1).not.toHaveBeenCalled();

      causeSecondSnapshot(relayLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      } satisfies SnapshotMessage<TSnapshot>);

      dispatch(relayLike, {
        type: "set destination",
        destination: consumer2,
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).not.toHaveBeenCalled();

      causeThirdSnapshot(relayLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      } satisfies SnapshotMessage<TSnapshot>);
    });

    it("should support unsetting destination", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const relayLike = relayConstructor(system);

      dispatch(relayLike, {
        type: "set destination",
        destination: consumer,
      });
      causeFirstSnapshot(relayLike);

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      } satisfies SnapshotMessage<TSnapshot>);

      dispatch(relayLike, {
        type: "unset destination",
      });
      causeSecondSnapshot(relayLike);

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
    });
  });
};
