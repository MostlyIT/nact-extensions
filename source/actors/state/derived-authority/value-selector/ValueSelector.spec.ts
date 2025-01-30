import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../../data-types/state-snapshot/Version";
import { delay } from "../../../../utility/__testing__/delay";
import { testRelayLike } from "../../../relay/__testing__/testRelayLike";
import { spawnValueSelector } from "./spawnValueSelector";
import { ValueSelector } from "./ValueSelector";

describe("ValueSelector", () => {
  {
    const sourceASymbol = Symbol();
    const sourceBSymbol = Symbol();
    testRelayLike<
      // @ts-expect-error
      ValueSelector<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceBSymbol>,
            typeof sourceBSymbol
          >;
        },
        string
      >,
      StateSnapshot<
        string,
        Version<typeof sourceASymbol | typeof sourceBSymbol>,
        undefined
      >
    >(
      (parent, options?) =>
        spawnValueSelector<
          {
            [sourceASymbol]: StateSnapshot<
              number,
              Version<typeof sourceASymbol>,
              typeof sourceASymbol
            >;
            [sourceBSymbol]: StateSnapshot<
              string,
              Version<typeof sourceBSymbol>,
              typeof sourceBSymbol
            >;
          },
          string,
          undefined
        >(
          parent,
          (inputs) => ({
            value: `${inputs[sourceASymbol]} ${inputs[sourceBSymbol]}`,
            cache: undefined,
          }),
          options
        ),
      (relayLike) =>
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: {
              [sourceASymbol]: 1000,
              [sourceBSymbol]: "monkeys",
            },
            version: {
              [sourceASymbol]: 0,
              [sourceBSymbol]: 0,
            },
            semanticSymbol: undefined,
          },
        }),
      {
        value: "1000 monkeys",
        version: {
          [sourceASymbol]: 0,
          [sourceBSymbol]: 0,
        },
        semanticSymbol: undefined,
      },
      (relayLike) =>
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: {
              [sourceASymbol]: 314,
              [sourceBSymbol]: "monkeys",
            },
            version: {
              [sourceASymbol]: 1,
              [sourceBSymbol]: 0,
            },
            semanticSymbol: undefined,
          },
        }),
      {
        value: "314 monkeys",
        version: {
          [sourceASymbol]: 1,
          [sourceBSymbol]: 0,
        },
        semanticSymbol: undefined,
      },
      (relayLike) =>
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: {
              [sourceASymbol]: 314,
              [sourceBSymbol]: "apples",
            },
            version: {
              [sourceASymbol]: 1,
              [sourceBSymbol]: 1,
            },
            semanticSymbol: undefined,
          },
        }),
      {
        value: "314 apples",
        version: {
          [sourceASymbol]: 1,
          [sourceBSymbol]: 1,
        },
        semanticSymbol: undefined,
      }
    );
  }

  describe("value selecting", () => {
    it("should supply the right types to value selector function", async () => {
      const system = start();

      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();
      spawnValueSelector<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceBSymbol>,
            typeof sourceBSymbol
          >;
        },
        string,
        null
      >(system, (inputs, cache) => {
        const numValue: number = inputs[sourceASymbol]; // Type test
        const strValue: string = inputs[sourceBSymbol]; // Type test
        const symbolValue: null | undefined = cache; // Type test
        return { value: `${numValue} ${strValue} ${symbolValue}`, cache };
      });
    });

    it("should select value based on inputs and value selector", async () => {
      const system = start();
      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();

      const mockCache = { computeCount: 0 };
      const valueSelector = spawnValueSelector<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceBSymbol>,
            typeof sourceBSymbol
          >;
        },
        string,
        typeof mockCache
      >(system, (inputs) => ({
        value: `${inputs[sourceASymbol]} + ${inputs[sourceBSymbol]}`,
        cache: mockCache,
      }));

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(valueSelector, {
        type: "set destination",
        destination: consumer,
      });

      dispatch(valueSelector, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceASymbol]: 42,
            [sourceBSymbol]: "test",
          },
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenCalledWith({
        type: "snapshot",
        snapshot: {
          value: "42 + test",
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });
    });

    it("should carry over versions unchanged", async () => {
      const system = start();
      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();

      const selector = spawnValueSelector<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceBSymbol>,
            typeof sourceBSymbol
          >;
        },
        string
      >(system, (inputs) => ({
        value: String(inputs[sourceASymbol]),
        cache: undefined,
      }));

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(selector, {
        type: "set destination",
        destination: consumer,
      });

      const inputVersion = {
        [sourceASymbol]: 42,
        [sourceBSymbol]: 17,
      };

      dispatch(selector, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceASymbol]: 100,
            [sourceBSymbol]: "test",
          },
          version: inputVersion,
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledWith({
        type: "snapshot",
        snapshot: {
          value: "100",
          version: inputVersion,
          semanticSymbol: undefined,
        },
      });
    });

    it("should not include semantic symbol in output state snapshots", async () => {
      const system = start();
      const sourceASymbol = Symbol();

      const selector = spawnValueSelector<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
        },
        number
      >(system, (inputs) => ({
        value: inputs[sourceASymbol],
        cache: undefined,
      }));

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(selector, {
        type: "set destination",
        destination: consumer,
      });

      dispatch(selector, {
        type: "snapshot",
        snapshot: {
          value: { [sourceASymbol]: 42 },
          version: { [sourceASymbol]: 1 },
          semanticSymbol: undefined,
        },
      });
      dispatch(selector, {
        type: "snapshot",
        snapshot: {
          value: { [sourceASymbol]: 1 },
          version: { [sourceASymbol]: 2 },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction.mock.calls[0][0].snapshot.semanticSymbol).toBe(
        undefined
      );
      expect(consumerFunction.mock.calls[1][0].snapshot.semanticSymbol).toBe(
        undefined
      );
    });

    it("should carry over cache between subsequent value selector function calls", async () => {
      const system = start();

      const cacheRecorder = vi.fn();

      const listSymbol = Symbol();
      const targetSymbol = Symbol();
      // Create selector that finds index of target in list
      const selector = spawnValueSelector<
        {
          [listSymbol]: StateSnapshot<
            number[],
            Version<typeof listSymbol>,
            typeof listSymbol
          >;
          [targetSymbol]: StateSnapshot<
            number,
            Version<typeof targetSymbol>,
            typeof targetSymbol
          >;
        },
        number | null,
        number
      >(system, (inputs, lastFoundIndex) => {
        cacheRecorder(lastFoundIndex);

        const list = inputs[listSymbol];
        const target = inputs[targetSymbol];

        // Start search from last found index if available
        if (lastFoundIndex !== undefined && list[lastFoundIndex] === target) {
          return { value: lastFoundIndex, cache: lastFoundIndex };
        }

        const indexWithNegative = list.indexOf(target);
        const index = indexWithNegative !== -1 ? indexWithNegative : null;
        return { value: index, cache: index ?? undefined };
      });

      // First search
      dispatch(selector, {
        type: "snapshot",
        snapshot: {
          value: {
            [listSymbol]: [10, 20, 30, 40],
            [targetSymbol]: 30,
          },
          version: {
            [listSymbol]: 1,
            [targetSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      // Second search with same target (should use cache)
      dispatch(selector, {
        type: "snapshot",
        snapshot: {
          value: {
            [listSymbol]: [10, 25, 30, 40],
            [targetSymbol]: 30,
          },
          version: {
            [listSymbol]: 2,
            [targetSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(cacheRecorder).toHaveBeenCalledTimes(2);
      expect(cacheRecorder).toHaveBeenNthCalledWith(1, undefined);
      expect(cacheRecorder).toHaveBeenNthCalledWith(2, 2);
    });

    it("should accept async function input", async () => {
      const system = start();
      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();

      const mockCache = { computeCount: 0 };
      const valueSelector = spawnValueSelector<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceBSymbol>,
            typeof sourceBSymbol
          >;
        },
        string,
        typeof mockCache
      >(system, async (inputs) => {
        await delay(2);
        return {
          value: `${inputs[sourceASymbol]} + ${inputs[sourceBSymbol]}`,
          cache: mockCache,
        };
      });

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(valueSelector, {
        type: "set destination",
        destination: consumer,
      });

      dispatch(valueSelector, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceASymbol]: 42,
            [sourceBSymbol]: "test",
          },
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenCalledWith({
        type: "snapshot",
        snapshot: {
          value: "42 + test",
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });
    });
  });
});
