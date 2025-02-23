import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import {
  dispatch,
  LocalActorRef,
  spawn,
  start,
} from "../../../vendored/@nact/core";
import { testPublisherLike } from "../../publisher/__testing__/testPublisherLike";
import { spawnPublisher } from "../../publisher/spawnPublisher";
import { testCombinerLike } from "../combiner/__testing__/testCombinerLike";
import { DerivedAuthority } from "./DerivedAuthority";
import { spawnDerivedAuthority } from "./spawnDerivedAuthority";

describe("DerivedAuthority", () => {
  describe("actor", () => {
    it("should correctly infer type from parameters", () => {
      const system = start();

      type StateSnapshotA = StateSnapshot<
        number,
        Version<typeof sourceASymbol>,
        typeof sourceASymbol
      >;
      const sourceASymbol = Symbol();
      const sourceA: LocalActorRef<SubscriptionMessage<StateSnapshotA>> = spawn(
        system,
        (state, _message) => state
      );
      type StateSnapshotB = StateSnapshot<
        string,
        Version<typeof sourceASymbol | typeof sourceBSymbol>,
        typeof sourceBSymbol
      >;
      const sourceBSymbol = Symbol();
      const sourceB: LocalActorRef<SubscriptionMessage<StateSnapshotB>> = spawn(
        system,
        (state, _message) => state
      );

      type StateSnapshotsObject = {
        readonly [sourceASymbol]: StateSnapshotA;
        readonly [sourceBSymbol]: StateSnapshotB;
      };

      const ownSymbol = Symbol();
      const derivedAuthority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [sourceASymbol]: sourceA,
          [sourceBSymbol]: sourceB,
        },
        async (inputs, cache) => ({
          value: inputs[sourceASymbol],
          cache,
        })
      );

      expectTypeOf(derivedAuthority).toMatchTypeOf<
        DerivedAuthority<StateSnapshotsObject, number, typeof ownSymbol>
      >();
    });
  });

  {
    const source = Symbol();
    const ownSource = Symbol();
    testPublisherLike(
      (parent, options) => {
        const inert =
          spawnPublisher<
            StateSnapshot<number, Version<typeof source>, typeof source>
          >(parent);
        return spawnDerivedAuthority(
          parent,
          ownSource,
          {
            [source]: inert,
          },
          async (inputs, cache) => ({
            value: 2 * inputs[source],
            cache,
          }),
          options
        );
      },
      (publisherLike) =>
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: 1000,
            version: {
              [source]: 0,
            },
            semanticSymbol: source,
          },
        }),
      {
        value: 2000,
        version: {
          [source]: 0,
        },
        semanticSymbol: ownSource,
      },
      (publisherLike) =>
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: 314,
            version: {
              [source]: 1,
            },
            semanticSymbol: source,
          },
        }),
      {
        value: 628,
        version: {
          [source]: 1,
        },
        semanticSymbol: ownSource,
      },
      (publisherLike) =>
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: 1,
            version: {
              [source]: 2,
            },
            semanticSymbol: source,
          },
        }),
      {
        value: 2,
        version: {
          [source]: 2,
        },
        semanticSymbol: ownSource,
      }
    );
  }

  {
    const ownSymbol = Symbol();
    testCombinerLike((parent, stateSnapshotSources, options) =>
      spawnDerivedAuthority(
        parent,
        ownSymbol,
        stateSnapshotSources,
        async (_inputs, cache) => ({ value: undefined, cache }),
        options
      )
    );
  }

  describe("deriving", () => {
    it("should disallow dispatching unsupported state snapshots", async () => {
      const system = start();
      const numberSourceSymbol = Symbol();
      const textSourceSymbol = Symbol();
      const otherSymbol = Symbol();
      const ownSymbol = Symbol();

      const numberSource =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof numberSourceSymbol>,
            typeof numberSourceSymbol
          >
        >(system);
      const textSource =
        spawnPublisher<
          StateSnapshot<
            string,
            Version<typeof textSourceSymbol>,
            typeof textSourceSymbol
          >
        >(system);
      const authority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [numberSourceSymbol]: numberSource,
          [textSourceSymbol]: textSource,
        },
        async (inputs, cache) => ({ value: inputs[numberSourceSymbol], cache })
      );

      () => {
        // Wrong value type.
        dispatch(authority, {
          type: "snapshot",
          snapshot: {
            // @ts-expect-error
            value: undefined,
            version: { [numberSourceSymbol]: 0 },
            semanticSymbol: numberSourceSymbol,
          },
        });
        // Wrong version symbol.
        dispatch(authority, {
          type: "snapshot",
          snapshot: {
            value: 42,
            // @ts-expect-error
            version: { [numberSourceSymbol]: 0, [otherSymbol]: 0 },
            semanticSymbol: numberSourceSymbol,
          },
        });
        // Unrecognized semantic symbol.
        dispatch(authority, {
          type: "snapshot",
          snapshot: {
            value: 42,
            version: { [numberSourceSymbol]: 0 },
            // @ts-expect-error
            semanticSymbol: otherSymbol,
          },
        });
        // Mixing between valid state snapshots.
        dispatch(authority, {
          type: "snapshot",
          // @ts-expect-error
          snapshot: {
            value: "string",
            version: { [numberSourceSymbol]: 0 },
            semanticSymbol: numberSourceSymbol,
          },
        });
        dispatch(authority, {
          type: "snapshot",
          snapshot: {
            value: 42,
            // @ts-expect-error
            version: { [textSourceSymbol]: 0 },
            semanticSymbol: numberSourceSymbol,
          },
        });
        dispatch(authority, {
          type: "snapshot",
          // @ts-expect-error
          snapshot: {
            value: 42,
            version: { [numberSourceSymbol]: 0 },
            semanticSymbol: textSourceSymbol,
          },
        });
      };
    });

    it("should supply the right types to value selector function", async () => {
      const system = start();
      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >
        >(system);

      spawnDerivedAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        string,
        typeof ownSymbol,
        { lastValue: number }
      >(
        system,
        ownSymbol,
        {
          [sourceSymbol]: source,
        },
        async (inputs, cache) => {
          const _inputValue: number = inputs[sourceSymbol]; // Type check
          const _cache: { lastValue: number } | undefined = cache; // Type check
          return {
            value: String(_inputValue),
            cache: { lastValue: _inputValue },
          };
        }
      );
    });

    it("should supply the right combined value to value selector function", async () => {
      const system = start();
      const quantitySymbol = Symbol();
      const wordSymbol = Symbol();
      const ownSymbol = Symbol();

      const source1 =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof quantitySymbol>,
            typeof quantitySymbol
          >
        >(system);
      const source2 =
        spawnPublisher<
          StateSnapshot<
            string,
            Version<typeof quantitySymbol | typeof wordSymbol>,
            typeof wordSymbol
          >
        >(system);

      const selectorFn = vi.fn(async (inputs) => ({
        value: `${inputs[quantitySymbol]}-${inputs[wordSymbol]}`,
        cache: undefined,
      }));

      const authority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [quantitySymbol]: source1,
          [wordSymbol]: source2,
        },
        selectorFn
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: { [quantitySymbol]: 0 },
          semanticSymbol: quantitySymbol,
        },
      });
      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: "apples",
          version: { [quantitySymbol]: 0, [wordSymbol]: 0 },
          semanticSymbol: wordSymbol,
        },
      });

      await delay(10);
      expect(selectorFn).toHaveBeenCalledTimes(1);
      expect(selectorFn).toHaveBeenNthCalledWith(
        1,
        {
          [quantitySymbol]: 42,
          [wordSymbol]: "apples",
        },
        undefined
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: "monkeys",
          version: { [quantitySymbol]: 0, [wordSymbol]: 1 },
          semanticSymbol: wordSymbol,
        },
      });

      await delay(10);
      expect(selectorFn).toHaveBeenCalledTimes(2);
      expect(selectorFn).toHaveBeenNthCalledWith(
        2,
        {
          [quantitySymbol]: 42,
          [wordSymbol]: "monkeys",
        },
        undefined
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1,
          version: { [quantitySymbol]: 1 },
          semanticSymbol: quantitySymbol,
        },
      });

      await delay(10);
      // Should not result in an additional call because the updated word value, which is based on the quantity value, likely "monkey", has not arrived.
      expect(selectorFn).toHaveBeenCalledTimes(2);
    });

    it("should replay last state snapshot message to new subscribers", async () => {
      const system = start();
      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >
        >(system);

      const authority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [sourceSymbol]: source,
        },
        async (inputs, cache) => ({
          value: inputs[sourceSymbol] * 2,
          cache,
        })
      );

      // Send initial state
      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 21,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer1,
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: ownSymbol,
        },
      });

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer2,
      });

      // Consumer 2 should have gotten same replay.
      await delay(10);
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "unsubscribe",
        subscriber: consumer1,
      });
      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer1,
      });

      // Consumer 1 should get same replay again if resubscribed.
      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(2);
      expect(consumerFunction1).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should carry over cache between subsequent value selector function calls", async () => {
      const system = start();
      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const cacheSpy = vi.fn();
      const source =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >
        >(system);

      const authority = spawnDerivedAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        number,
        typeof ownSymbol,
        { count: number }
      >(
        system,
        ownSymbol,
        {
          [sourceSymbol]: source,
        },
        async (inputs, cache) => {
          cacheSpy(cache);
          const newCount = (cache?.count ?? 0) + 1;
          return {
            value: inputs[sourceSymbol],
            cache: { count: newCount },
          };
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(cacheSpy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenNthCalledWith(1, undefined);

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 2,
          version: { [sourceSymbol]: 1 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      expect(cacheSpy).toHaveBeenNthCalledWith(2, { count: 1 });
    });

    it("should select value based on inputs and value selector", async () => {
      const system = start();
      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >
        >(system);

      const authority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [sourceSymbol]: source,
        },
        async (inputs) => ({
          value: 2 * inputs[sourceSymbol],
          cache: undefined,
        })
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 21,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1,
          version: { [sourceSymbol]: 1 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2,
          version: { [sourceSymbol]: 1 },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should carry over versions unchanged", async () => {
      const system = start();
      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >
        >(system);

      const authority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [sourceSymbol]: source,
        },
        async (inputs) => ({
          value: 2 * inputs[sourceSymbol],
          cache: undefined,
        })
      );

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer,
      });

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbol]: 42 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.version).toEqual({
        [sourceSymbol]: 42,
      });

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbol]: 12 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction.mock.calls[1][0].snapshot.version).toEqual({
        [sourceSymbol]: 12,
      });
    });

    it("should brand state snapshots with its semantic symbol", async () => {
      const system = start();
      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >
        >(system);

      const authority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [sourceSymbol]: source,
        },
        async (inputs) => ({
          value: inputs[sourceSymbol],
          cache: undefined,
        })
      );

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer,
      });

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.semanticSymbol).toBe(
        ownSymbol
      );
    });

    it("should accept async function input", async () => {
      const system = start();
      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source =
        spawnPublisher<
          StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >
        >(system);

      const authority = spawnDerivedAuthority(
        system,
        ownSymbol,
        {
          [sourceSymbol]: source,
        },
        async (inputs) => {
          await delay(2);
          return {
            value: 2 * inputs[sourceSymbol],
            cache: undefined,
          };
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 21,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      dispatch(authority, {
        type: "subscribe",
        subscriber: consumer,
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 42,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1,
          version: { [sourceSymbol]: 1 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2,
          version: { [sourceSymbol]: 1 },
          semanticSymbol: ownSymbol,
        },
      });
    });
  });
});
