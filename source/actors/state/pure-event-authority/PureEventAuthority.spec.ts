import { dispatch, spawn, start } from "@nact/core";
import { Set } from "immutable";
import { describe, expect, it, vi } from "vitest";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { testPublisherLike } from "../../publisher/__testing__/testPublisherLike";
import { PureEventAuthority } from "./PureEventAuthority";
import { spawnPureEventAuthority } from "./spawnPureEventAuthority";

describe("PureEventAuthority", () => {
  {
    const ownSourceSymbol = Symbol();
    testPublisherLike<
      // @ts-expect-error
      PureEventAuthority<"increment", number, typeof ownSourceSymbol>,
      StateSnapshot<
        number,
        Version<typeof ownSourceSymbol>,
        typeof ownSourceSymbol
      >
    >(
      (parent, options?) =>
        spawnPureEventAuthority<
          "increment",
          number,
          typeof ownSourceSymbol,
          number
        >(
          parent,
          ownSourceSymbol,
          (state, _eventMessage) => state + 1,
          (state) => state,
          (previous, current) => previous === current,
          0,
          options
        ),
      (publisherLike) => dispatch(publisherLike, "increment"),
      {
        value: 1,
        version: { [ownSourceSymbol]: 1 },
        semanticSymbol: ownSourceSymbol,
      },
      (publisherLike) => dispatch(publisherLike, "increment"),
      {
        value: 2,
        version: { [ownSourceSymbol]: 2 },
        semanticSymbol: ownSourceSymbol,
      },
      (publisherLike) => dispatch(publisherLike, "increment"),
      {
        value: 3,
        version: { [ownSourceSymbol]: 3 },
        semanticSymbol: ownSourceSymbol,
      }
    );
  }

  describe("value management", () => {
    it("should supply the right types to the input functions", () => {
      const system = start();
      const ownSourceSymbol = Symbol();

      spawnPureEventAuthority<
        "toggle doubling",
        number,
        typeof ownSourceSymbol,
        boolean
      >(
        system,
        ownSourceSymbol,
        (state, eventMessage) => {
          const stateValue: boolean = state; // Type test
          const eventMessageValue: "toggle doubling" = eventMessage; // Type test
          return !state;
        },
        (state) => {
          const stateValue: boolean = state; // Type test
          return state ? 2000 : 1000;
        },
        (previous, current) => {
          const previousValue: number = previous; // Type test
          const currentValue: number = current; // Type test;
          return previous === current;
        },
        false
      );
    });

    it("should base output value on events", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();

      const authority = spawnPureEventAuthority<
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        (state, _eventMessage) => !state,
        (state) => (state ? 2000 : 1000),
        (previous, current) => previous === current,
        false,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2000,
          version: {
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [ownSymbol]: 2,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);
    });

    it("should skip output when value is equal according to equality comparator", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();

      const authority = spawnPureEventAuthority<
        "toggle",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        (state, _eventMessage) => !state,
        (state) => (state ? 0 : 0), // Always returns 0 to test equality comparison
        (previous, current) => previous === current,
        false,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.value).toBe(0);

      dispatch(authority, "toggle");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1); // No new call since value is equal
    });

    it("should add own semantic symbol with unique value on every state snapshot", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();

      const authority = spawnPureEventAuthority<
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        (state, _eventMessage) => !state,
        (state) => (state ? 2000 : 1000),
        (previous, current) => previous === current,
        false,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(
        consumerFunction.mock.calls[0][0].snapshot.version[ownSymbol]
      ).toBe(0);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(
        consumerFunction.mock.calls[1][0].snapshot.version[ownSymbol]
      ).toBe(1);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(
        consumerFunction.mock.calls[2][0].snapshot.version[ownSymbol]
      ).toBe(2);
    });

    it("should brand output state snapshots with own semantic symbol", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();

      const authority = spawnPureEventAuthority<
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        (state, _eventMessage) => !state,
        (state) => (state ? 2000 : 1000),
        (previous, current) => previous === current,
        false,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.semanticSymbol).toBe(
        ownSymbol
      );

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction.mock.calls[1][0].snapshot.semanticSymbol).toBe(
        ownSymbol
      );
    });

    it("should replay last state snapshot message to new subscribers", async () => {
      const system = start();

      const consumer1Function = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumer1Function(message)
      );

      const consumer2Function = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumer2Function(message)
      );

      const ownSymbol = Symbol();

      const authority = spawnPureEventAuthority<
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        (state, _eventMessage) => !state,
        (state) => (state ? 2000 : 1000),
        (previous, current) => previous === current,
        false,
        {
          initialSubscribersSet: Set([consumer1]),
        }
      );

      await delay(10);
      expect(consumer1Function).toHaveBeenCalledTimes(1);
      expect(consumer1Function).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });
      expect(consumer2Function).not.toHaveBeenCalled();

      dispatch(authority, "toggle doubling");
      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer2,
      });

      await delay(10);
      expect(consumer1Function).toHaveBeenCalledTimes(2);
      expect(consumer1Function).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2000,
          version: {
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
      expect(consumer2Function).toHaveBeenCalledTimes(1);
      expect(consumer2Function).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 2000,
          version: {
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should accept async function input", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();

      const authority = spawnPureEventAuthority<
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        async (state, _eventMessage) => {
          await delay(2);
          return !state;
        },
        async (state) => {
          await delay(2);
          return state ? 2000 : 1000;
        },
        async (previous, current) => {
          await delay(2);
          return previous === current;
        },
        false,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2000,
          version: {
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [ownSymbol]: 2,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);
    });
  });
});
