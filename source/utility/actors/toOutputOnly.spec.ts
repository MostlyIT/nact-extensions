import { describe, expect, it, vi } from "vitest";
import { spawnPublisher } from "../../actors/publisher/spawnPublisher";
import { spawnRelay } from "../../actors/relay/spawnRelay";
import { DestinationMessage } from "../../data-types/messages/DestinationMessage";
import { SnapshotMessage } from "../../data-types/messages/SnapshotMessage";
import { SubscriptionMessage } from "../../data-types/messages/SubscriptionMessage";
import {
  dispatch,
  Dispatchable,
  LocalActorRef,
  spawn,
  start,
} from "../../vendored/@nact/core";
import { delay } from "../__testing__/delay";
import { toOutputOnly } from "./toOutputOnly";

describe("toOutputOnly", () => {
  describe("subscription messages", () => {
    it("should allow subscribe messages to be dispatched", async () => {
      const system = start();

      const publisher = spawnPublisher<number>(system);

      const outputOnlyPublisher = toOutputOnly(publisher);

      // Type test - should not error
      dispatch(outputOnlyPublisher, {
        type: "subscribe",
        subscriber: spawn(system, (state, _message: number) => state),
      });

      // Type test - should not error
      dispatch(outputOnlyPublisher, {
        type: "unsubscribe",
        subscriber: spawn(system, (state, _message: number) => state),
      });
    });

    it("should disallow dispatching snapshot messages", () => {
      const system = start();

      const publisher = spawnPublisher<number>(system);

      const outputOnlyPublisher = toOutputOnly(publisher);

      dispatch(outputOnlyPublisher, {
        // @ts-expect-error
        type: "snapshot",
        snapshot: 42,
      } satisfies SnapshotMessage<number>);
    });

    it("should maintain subscription functionality", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const publisher = spawnPublisher<number>(system);

      const outputOnlyPublisher = toOutputOnly(publisher);

      // Subscribe through output-only reference
      dispatch(outputOnlyPublisher, {
        type: "subscribe",
        subscriber: consumer,
      });

      // Send snapshot through original reference
      dispatch(publisher, {
        type: "snapshot",
        snapshot: 42,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenCalledWith({
        type: "snapshot",
        snapshot: 42,
      });
    });

    it("should not accept actors that only processes one of the two subscription message types", async () => {
      const system = start();

      const subscribeOnlyActor = spawn(
        system,
        (
          state: undefined,
          message:
            | {
                readonly type: "subscribe";
                readonly subscriber: Dispatchable<SnapshotMessage<number>>;
              }
            | 1000
        ) => {
          console.log(message);
          return state;
        }
      );
      const _test1: never = toOutputOnly(subscribeOnlyActor);

      const unsubscribeOnlyActor = spawn(
        system,
        (
          state: undefined,
          message:
            | {
                readonly type: "unsubscribe";
                readonly subscriber: Dispatchable<SnapshotMessage<number>>;
              }
            | 1000
        ) => {
          console.log(message);
          return state;
        }
      );
      const _test2: never = toOutputOnly(unsubscribeOnlyActor);
    });
  });

  describe("destination messages", () => {
    it("should allow destination messages to be dispatched", async () => {
      const system = start();

      const relay = spawnRelay<number>(system);

      const outputOnlyRelay = toOutputOnly(relay);

      // Type test - should not error
      dispatch(outputOnlyRelay, {
        type: "set destination",
        destination: spawn(system, (state, _message) => state),
      });

      // Type test - should not error
      dispatch(outputOnlyRelay, {
        type: "unset destination",
      });
    });

    it("should block dispatching snapshot messages", () => {
      const system = start();

      const relay = spawnRelay<number>(system);

      const outputOnlyRelay = toOutputOnly(relay);

      dispatch(outputOnlyRelay, {
        // @ts-expect-error
        type: "snapshot",
        snapshot: 42,
      } satisfies SnapshotMessage<number>);
    });

    it("should maintain relay functionality", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const relay = spawnRelay<number>(system);

      const outputOnlyRelay = toOutputOnly(relay);

      // Set destination through output-only reference
      dispatch(outputOnlyRelay, {
        type: "set destination",
        destination: consumer,
      });

      // Send snapshot through original reference
      dispatch(relay, {
        type: "snapshot",
        snapshot: 42,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenCalledWith({
        type: "snapshot",
        snapshot: 42,
      } satisfies SnapshotMessage<number>);
    });

    it("should not accept actors that only processes one of the two destination message types", async () => {
      const system = start();

      const setDestinationOnlyActor = spawn(
        system,
        (
          state: undefined,
          message:
            | {
                readonly type: "set destination";
                readonly destination: Dispatchable<SnapshotMessage<number>>;
              }
            | 1000
        ) => {
          console.log(message);
          return state;
        }
      );
      const _test1: never = toOutputOnly(setDestinationOnlyActor);

      const unsetDestinationOnlyActor = spawn(
        system,
        (
          state: undefined,
          message:
            | {
                readonly type: "unset destination";
              }
            | 1000
        ) => {
          console.log(message);
          return state;
        }
      );
      const _test2: never = toOutputOnly(unsetDestinationOnlyActor);
    });
  });

  describe("type inference", () => {
    it("should infer correct types for publisher actors", () => {
      const system = start();

      const publisher = spawnPublisher<number>(system);

      const outputOnlyPublisher = toOutputOnly(publisher);

      const _test: LocalActorRef<SubscriptionMessage<number>> =
        outputOnlyPublisher;
    });

    it("should infer correct types for relay actors", () => {
      const system = start();

      const relay = spawnRelay<number>(system);

      const outputOnlyRelay = toOutputOnly(relay);

      const _test: LocalActorRef<DestinationMessage<number>> = outputOnlyRelay;
    });
  });
});
