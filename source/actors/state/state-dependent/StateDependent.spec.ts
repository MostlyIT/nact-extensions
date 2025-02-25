import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { dispatch, start } from "../../../vendored/@nact/core";
import { spawnPublisher } from "../../publisher/spawnPublisher";
import { testCombinerLike } from "../combiner/__testing__/testCombinerLike";
import { spawnOpenAuthority } from "../open-authority/spawnOpenAuthority";
import { spawnStateDependent } from "./spawnStateDependent";
import { StateDependent } from "./StateDependent";

describe("StateDependent", () => {
  describe("actor", () => {
    it("should correctly infer type form parameters", () => {
      const system = start();

      const numberSymbol = Symbol();
      const numberAuthority = spawnOpenAuthority(system, numberSymbol, 1);

      const textSymbol = Symbol();
      const textAuthority = spawnOpenAuthority(system, textSymbol, "bags");

      const stateDependent = spawnStateDependent(
        system,
        {
          [numberSymbol]: numberAuthority,
          [textSymbol]: textAuthority,
        },
        async (state: string, _message: undefined, lastCombinedObject) => {
          console.log(
            state,
            lastCombinedObject[numberSymbol],
            lastCombinedObject[textSymbol]
          );
          return state;
        },
        async (_state, newCombinedObject) => {
          return (
            newCombinedObject[numberSymbol] + newCombinedObject[textSymbol]
          );
        },
        ""
      );

      expectTypeOf(stateDependent).toMatchTypeOf<
        StateDependent<
          {
            readonly [numberSymbol]: StateSnapshot<
              number,
              Version<typeof numberSymbol>,
              typeof numberSymbol
            >;
            readonly [textSymbol]: StateSnapshot<
              string,
              Version<typeof textSymbol>,
              typeof textSymbol
            >;
          },
          undefined
        >
      >();
    });
  });

  {
    testCombinerLike((parent, stateSnapshotSources, options) =>
      spawnStateDependent(
        parent,
        stateSnapshotSources,
        async (state, _message, _lastCombinedObject) => state,
        async (state, _newCombinedObject) => state,
        undefined,
        options
      )
    );
  }

  describe("state dependence", () => {
    it("should disallow dispatching unsupported state snapshots", async () => {
      const system = start();

      const numberSourceSymbol = Symbol();
      const textSourceSymbol = Symbol();
      const otherSymbol = Symbol();

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

      const authority = spawnStateDependent(
        system,
        {
          [numberSourceSymbol]: numberSource,
          [textSourceSymbol]: textSource,
        },
        async (state, _eventMessage: "toggle", _lastCombinedObject) => !state,
        async (state, _newCombinedObject) => state,
        false
      );

      () => {
        // Wrong value type
        dispatch(authority, {
          type: "snapshot",
          snapshot: {
            // @ts-expect-error
            value: undefined,
            version: { [numberSourceSymbol]: 0 },
            semanticSymbol: numberSourceSymbol,
          },
        });
        // Wrong version symbol
        dispatch(authority, {
          type: "snapshot",
          snapshot: {
            value: 42,
            // @ts-expect-error
            version: { [numberSourceSymbol]: 0, [otherSymbol]: 0 },
            semanticSymbol: numberSourceSymbol,
          },
        });
        // Unrecognized semantic symbol
        dispatch(authority, {
          type: "snapshot",
          snapshot: {
            value: 42,
            version: { [numberSourceSymbol]: 0 },
            // @ts-expect-error
            semanticSymbol: otherSymbol,
          },
        });
        // Mixing between valid state snapshots
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

    it("should supply the right types to the input functions", () => {
      const system = start();

      const numberSourceSymbol = Symbol();
      const textSourceSymbol = Symbol();

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

      spawnStateDependent(
        system,
        {
          [numberSourceSymbol]: numberSource,
          [textSourceSymbol]: textSource,
        },
        async (state, _eventMessage: "toggle", lastCombinedObject) => {
          const stateValue: boolean = state;
          const numberSourceValue: number =
            lastCombinedObject[numberSourceSymbol];
          const textSourceValue: string = lastCombinedObject[textSourceSymbol];
          return !state;
        },
        async (state, newCombinedObject) => {
          const stateValue: boolean = state;
          const numberSourceValue: number =
            newCombinedObject[numberSourceSymbol];
          const textSourceValue: string = newCombinedObject[textSourceSymbol];
          return state;
        },
        false
      );
    });

    it("should process events with state available", async () => {
      const system = start();

      const spy = vi.fn();

      const numberSourceSymbol = Symbol();
      const textSourceSymbol = Symbol();

      const numberSource = spawnOpenAuthority(system, numberSourceSymbol, 1000);
      const textSource = spawnOpenAuthority(system, textSourceSymbol, "banana");

      const authority = spawnStateDependent(
        system,
        {
          [numberSourceSymbol]: numberSource,
          [textSourceSymbol]: textSource,
        },
        async (
          state,
          eventMessage: "toggle" | "output",
          lastCombinedObject
        ) => {
          switch (eventMessage) {
            case "output":
              spy(
                state
                  ? lastCombinedObject[numberSourceSymbol]
                  : lastCombinedObject[textSourceSymbol]
              );
              return state;
            case "toggle":
              return !state;
          }
        },
        async (state, _newCombinedObject) => {
          return state;
        },
        true,
        {
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(spy).not.toHaveBeenCalled();

      dispatch(authority, "output");
      dispatch(authority, "output");

      await delay(10);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(1, 1000);
      expect(spy).toHaveBeenNthCalledWith(2, 1000);

      dispatch(numberSource, {
        type: "replace content",
        value: 314,
      });

      await delay(10);
      expect(spy).toHaveBeenCalledTimes(2);

      dispatch(authority, "output");

      await delay(10);
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(3, 314);

      dispatch(authority, "toggle");

      await delay(10);
      expect(spy).toHaveBeenCalledTimes(3);

      dispatch(authority, "output");

      await delay(10);
      expect(spy).toHaveBeenCalledTimes(4);
      expect(spy).toHaveBeenNthCalledWith(4, "banana");
    });
  });
});
