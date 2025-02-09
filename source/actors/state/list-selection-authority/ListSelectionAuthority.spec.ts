import { List, Set } from "immutable";
import { describe, expect, it, vi } from "vitest";
import { SelectValueMessage } from "../../../data-types/messages/SelectValueMessage";
import { delay } from "../../../utility/__testing__/delay";
import { dispatch, spawn, start } from "../../../vendored/@nact/core";
import { testPublisherLike } from "../../publisher/__testing__/testPublisherLike";
import { testCombinerLike } from "../combiner/__testing__/testCombinerLike";
import { spawnOpenAuthority } from "../open-authority/spawnOpenAuthority";
import { spawnListSelectionAuthority } from "./spawnListSelectionAuthority";

describe("ListSelectionAuthority", () => {
  {
    const listSymbol = Symbol();
    const ownSymbol = Symbol();
    testPublisherLike(
      (parent, options?) => {
        const inertListSource = spawnOpenAuthority(
          parent,
          listSymbol,
          null as List<number> | null
        );
        return spawnListSelectionAuthority(
          parent,
          ownSymbol,
          { [listSymbol]: inertListSource },
          options
        );
      },
      (publisherLike) => {
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: List([1, 2, 3]),
            version: { [listSymbol]: 0 },
            semanticSymbol: listSymbol,
          },
        });
        dispatch(publisherLike, {
          type: "select value",
          value: 1,
        } satisfies SelectValueMessage<number>);
      },
      {
        value: 1,
        version: { [listSymbol]: 0, [ownSymbol]: 0 },
        semanticSymbol: ownSymbol,
      },
      (publisherLike) => {
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: List([1, 2]),
            version: { [listSymbol]: 1 },
            semanticSymbol: listSymbol,
          },
        });
      },
      {
        value: 1,
        version: { [listSymbol]: 1, [ownSymbol]: 1 },
        semanticSymbol: ownSymbol,
      },
      (publisherLike) => {
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: List([2]),
            version: { [listSymbol]: 2 },
            semanticSymbol: listSymbol,
          },
        });
      },
      {
        value: null,
        version: { [listSymbol]: 2, [ownSymbol]: 2 },
        semanticSymbol: ownSymbol,
      }
    );
  }

  {
    const ownSymbol = Symbol();
    testCombinerLike((parent, stateSnapshotSources, options) =>
      spawnListSelectionAuthority(
        parent,
        ownSymbol,
        stateSnapshotSources,
        options
      )
    );
  }

  describe("selection management", () => {
    it("should handle initial state with no selection", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000])
      );

      const ownSymbol = Symbol();
      spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should allow selecting a value from the list", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000, 314, 1])
      );

      const ownSymbol = Symbol();
      const authority = spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      consumerFunction.mockClear();

      dispatch(authority, {
        type: "select value",
        value: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should not allow selecting a value not in the list", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000, 314, 1])
      );

      const ownSymbol = Symbol();
      const authority = spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "select value",
        value: 4,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
    });

    it("should clear selection when selected value is removed from list", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000, 314, 1])
      );

      const ownSymbol = Symbol();
      const authority = spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "select value",
        value: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(listSource, {
        type: "transform content",
        transformer: (list) => list.filter((value) => value !== 314),
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 1,
            [ownSymbol]: 2,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should maintain selection when value remains in list", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000, 314, 1])
      );

      const ownSymbol = Symbol();
      const authority = spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "select value",
        value: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(listSource, {
        type: "replace content",
        value: List([314]),
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 1,
            [ownSymbol]: 2,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should handle null list value", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000, 314, 1]) as List<number> | null
      );

      const ownSymbol = Symbol();
      const authority = spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "select value",
        value: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(listSource, {
        type: "replace content",
        value: null,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 1,
            [ownSymbol]: 2,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should handle explicitly selecting null", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000, 314, 1]) as List<number> | null
      );

      const ownSymbol = Symbol();
      const authority = spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "select value",
        value: 314,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "select value",
        value: null,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 2,
          },
          semanticSymbol: ownSymbol,
        },
      });
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

      const listSymbol = Symbol();
      const listSource = spawnOpenAuthority(
        system,
        listSymbol,
        List<number>([1000, 314, 1]) as List<number> | null
      );

      const ownSymbol = Symbol();
      const authority = spawnListSelectionAuthority(
        system,
        ownSymbol,
        { [listSymbol]: listSource },
        {
          initialSubscribersSet: Set([consumer1]),
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(consumer1Function).toHaveBeenCalledTimes(1);
      expect(consumer1Function).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: null,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "select value",
        value: 314,
      });

      await delay(10);
      expect(consumer1Function).toHaveBeenCalledTimes(2);
      expect(consumer1Function).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
      expect(consumer2Function).not.toHaveBeenCalled();

      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer2,
      });

      await delay(10);
      expect(consumer2Function).toHaveBeenCalledTimes(1);
      expect(consumer2Function).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [listSymbol]: 0,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });
  });
});
