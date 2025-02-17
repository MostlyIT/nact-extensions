import { Set } from "immutable";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { dispatch, spawn, start } from "../../../vendored/@nact/core";
import { testPublisherLike } from "../../publisher/__testing__/testPublisherLike";
import { OpenAuthority } from "./OpenAuthority";
import { spawnOpenAuthority } from "./spawnOpenAuthority";

describe("OpenAuthority", () => {
  describe("actor", () => {
    it("should correctly infer type from parameters", () => {
      const system = start();

      const ownSymbol = Symbol();
      const openAuthority = spawnOpenAuthority(system, ownSymbol, 1000);

      expectTypeOf(openAuthority).toMatchTypeOf<
        OpenAuthority<number, typeof ownSymbol>
      >();
    });
  });

  {
    const ownSourceSymbol = Symbol();
    testPublisherLike(
      (parent, options?) =>
        spawnOpenAuthority(parent, ownSourceSymbol, 0 as number, options),
      (authorityLike) =>
        dispatch(authorityLike, {
          type: "transform content",
          transformer: (value) => value + 1,
        }),
      {
        value: 1,
        version: { [ownSourceSymbol]: 1 },
        semanticSymbol: ownSourceSymbol,
      },
      (authorityLike) =>
        dispatch(authorityLike, {
          type: "replace content",
          value: 42,
        }),
      {
        value: 42,
        version: { [ownSourceSymbol]: 2 },
        semanticSymbol: ownSourceSymbol,
      },
      (authorityLike) =>
        dispatch(authorityLike, {
          type: "transform content",
          transformer: (value) => value * 2,
        }),
      {
        value: 84,
        version: { [ownSourceSymbol]: 3 },
        semanticSymbol: ownSourceSymbol,
      }
    );
  }

  describe("value management", () => {
    it("should support initial value", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();
      const initialValue = 42;

      spawnOpenAuthority(system, ownSymbol, initialValue, {
        initialSubscribersSet: Set([consumer]),
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: initialValue,
          version: {
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);
    });

    it("should handle replace content events", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();
      const authority = spawnOpenAuthority(system, ownSymbol, 0, {
        initialSubscribersSet: Set([consumer]),
      });

      await delay(10);
      consumerFunction.mockClear();

      dispatch(authority, {
        type: "replace content",
        value: 42,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: {
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);
    });

    it("should handle transform content events", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();
      const authority = spawnOpenAuthority(system, ownSymbol, 1, {
        initialSubscribersSet: Set([consumer]),
      });

      await delay(10);
      consumerFunction.mockClear();

      dispatch(authority, {
        type: "transform content",
        transformer: (value) => value * 2,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 2,
          version: {
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSymbol>, typeof ownSymbol>>);
    });

    it("should skip output when new value is equal", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();
      const authority = spawnOpenAuthority(system, ownSymbol, 42, {
        initialSubscribersSet: Set([consumer]),
      });

      await delay(10);
      consumerFunction.mockClear();

      dispatch(authority, {
        type: "transform content",
        transformer: (value) => value,
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(authority, {
        type: "replace content",
        value: 42,
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();
    });

    it("should add own semantic symbol with unique value on every state snapshot", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSymbol = Symbol();
      const authority = spawnOpenAuthority(system, ownSymbol, 0, {
        initialSubscribersSet: Set([consumer]),
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(
        consumerFunction.mock.calls[0][0].snapshot.version[ownSymbol]
      ).toBe(0);

      dispatch(authority, {
        type: "transform content",
        transformer: (value) => value + 1,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(
        consumerFunction.mock.calls[1][0].snapshot.version[ownSymbol]
      ).toBe(1);

      dispatch(authority, {
        type: "replace content",
        value: 42,
      });

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
      const authority = spawnOpenAuthority(system, ownSymbol, 0, {
        initialSubscribersSet: Set([consumer]),
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.semanticSymbol).toBe(
        ownSymbol
      );

      dispatch(authority, {
        type: "replace content",
        value: 42,
      });

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
      const authority = spawnOpenAuthority(system, ownSymbol, 0, {
        initialSubscribersSet: Set([consumer1]),
      });

      await delay(10);
      expect(consumer1Function).toHaveBeenCalledTimes(1);
      expect(consumer1Function).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });
      expect(consumer2Function).not.toHaveBeenCalled();

      dispatch(authority, {
        type: "replace content",
        value: 42,
      });
      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer2,
      });

      await delay(10);
      expect(consumer1Function).toHaveBeenCalledTimes(2);
      expect(consumer1Function).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 42,
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
          value: 42,
          version: {
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });
  });
});
