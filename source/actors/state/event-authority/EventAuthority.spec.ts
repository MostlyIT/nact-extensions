import { dispatch, spawn, start } from "@nact/core";
import { Set } from "immutable";
import { describe, expect, it, vi } from "vitest";
import { SnapshotMessage } from "../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { testPublisherLike } from "../../publisher/__testing__/testPublisherLike";
import { spawnPublisher } from "../../publisher/spawnPublisher";
import { testCombinerLike } from "../combiner/__testing__/testCombinerLike";
import { EventAuthority } from "./EventAuthority";
import { spawnEventAuthority } from "./spawnEventAuthority";

describe("EventAuthority", () => {
  {
    const sourceSymbol = Symbol();
    const ownSourceSymbol = Symbol();
    testPublisherLike<
      // @ts-expect-error
      EventAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSourceSymbol
      >,
      StateSnapshot<
        number,
        Version<typeof sourceSymbol | typeof ownSourceSymbol>,
        typeof ownSourceSymbol
      >
    >(
      (parent, options?) => {
        const inert =
          spawnPublisher<
            StateSnapshot<
              number,
              Version<typeof sourceSymbol>,
              typeof sourceSymbol
            >
          >(parent);
        return spawnEventAuthority<
          {
            [sourceSymbol]: StateSnapshot<
              number,
              Version<typeof sourceSymbol>,
              typeof sourceSymbol
            >;
          },
          "toggle doubling",
          number,
          typeof ownSourceSymbol,
          boolean
        >(
          parent,
          ownSourceSymbol,
          // @ts-expect-error
          { [sourceSymbol]: inert },
          (state, _eventMessage, _lastCombinedObject) => !state,
          (state, _newCombinedObject) => (state !== undefined ? state : false),
          (state, lastCombinedObject) =>
            (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
          (previous, current) => previous === current,
          options
        );
      },
      (publisherLike) =>
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: 1000,
            version: { [sourceSymbol]: 0 },
            semanticSymbol: sourceSymbol,
          },
        }),
      {
        value: 1000,
        version: { [sourceSymbol]: 0, [ownSourceSymbol]: 0 },
        semanticSymbol: ownSourceSymbol,
      },
      (publisherLike) =>
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: 314,
            version: { [sourceSymbol]: 1 },
            semanticSymbol: sourceSymbol,
          },
        }),
      {
        value: 314,
        version: { [sourceSymbol]: 1, [ownSourceSymbol]: 1 },
        semanticSymbol: ownSourceSymbol,
      },
      (publisherLike) =>
        dispatch(publisherLike, {
          type: "snapshot",
          snapshot: {
            value: 1,
            version: { [sourceSymbol]: 2 },
            semanticSymbol: sourceSymbol,
          },
        }),
      {
        value: 1,
        version: { [sourceSymbol]: 2, [ownSourceSymbol]: 2 },
        semanticSymbol: ownSourceSymbol,
      }
    );
  }

  {
    const ownSymbol = Symbol();
    testCombinerLike((parent, stateSnapshotSources, options) =>
      spawnEventAuthority(
        parent,
        ownSymbol,
        stateSnapshotSources,
        (state, _eventMessage, _lastCombinedObject) => state,
        (_state, _newCombinedObject) => undefined,
        (state) => state,
        (previous, current) => previous === current,
        options
      )
    );
  }

  describe("value management", () => {
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

      const authority = spawnEventAuthority<
        {
          [numberSourceSymbol]: StateSnapshot<
            number,
            Version<typeof numberSourceSymbol>,
            typeof numberSourceSymbol
          >;
          [textSourceSymbol]: StateSnapshot<
            string,
            Version<typeof textSourceSymbol>,
            typeof textSourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        {
          // @ts-expect-error
          [numberSourceSymbol]: numberSource,
          // @ts-expect-error
          [textSourceSymbol]: textSource,
        },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[numberSourceSymbol],
        (previous, current) => previous === current
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
      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();
      const ownSourceSymbol = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      spawnEventAuthority<
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
        "toggle doubling",
        number,
        typeof ownSourceSymbol,
        boolean
      >(
        system,
        ownSourceSymbol,
        {
          [sourceASymbol]: sourceA,
          [sourceBSymbol]: sourceB,
        },
        (state, eventMessage, lastCombinedObject) => {
          const stateValue: boolean = state; // Type test
          const eventMessageValue: "toggle doubling" = eventMessage; // Type test
          const sourceAValue: number = lastCombinedObject[sourceASymbol]; // Type test
          const sourceBValue: string = lastCombinedObject[sourceBSymbol]; // Type test
          return !state;
        },
        (state, newCombinedObject) => {
          const stateValue: boolean | undefined = state; // Type test
          const sourceAValue: number = newCombinedObject[sourceASymbol]; // Type test
          const sourceBValue: string = newCombinedObject[sourceBSymbol]; // Type test
          return state !== undefined ? state : false;
        },
        (state, lastCombinedObject) => {
          const stateValue: boolean = state; // Type test
          const sourceAValue: number = lastCombinedObject[sourceASymbol]; // Type test
          const sourceBValue: string = lastCombinedObject[sourceBSymbol]; // Type test
          return (state ? 2 : 1) * lastCombinedObject[sourceASymbol];
        },
        (previous, current) => {
          const previousValue: number = previous; // Type test
          const currentValue: number = current; // Type test;
          return previous === current;
        }
      );
    });

    it("should base output value on events", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbol = Symbol();
      const ownSourceSymbol = Symbol();

      const source = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSourceSymbol,
        boolean
      >(
        system,
        ownSourceSymbol,
        { [sourceSymbol]: source },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceSymbol]: 0,
            [ownSourceSymbol]: 0,
          },
          semanticSymbol: ownSourceSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof sourceSymbol | typeof ownSourceSymbol>, typeof ownSourceSymbol>>);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2000,
          version: {
            [sourceSymbol]: 0,
            [ownSourceSymbol]: 1,
          },
          semanticSymbol: ownSourceSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof sourceSymbol | typeof ownSourceSymbol>, typeof ownSourceSymbol>>);

      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceSymbol]: 0,
            [ownSourceSymbol]: 2,
          },
          semanticSymbol: ownSourceSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof sourceSymbol | typeof ownSourceSymbol>, typeof ownSourceSymbol>>);
    });

    it("should base output value on events even when there are no inputs", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const ownSourceSymbol = Symbol();
      const authority = spawnEventAuthority<
        {},
        number,
        number,
        typeof ownSourceSymbol,
        number
      >(
        system,
        ownSourceSymbol,
        {},
        (_state, eventMessage, _lastCombinedObject) => eventMessage,
        (state, _newCombinedObject) => state ?? 0,
        (state, _lastCombinedObject) => state,
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [ownSourceSymbol]: 0,
          },
          semanticSymbol: ownSourceSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSourceSymbol>, typeof ownSourceSymbol>>);

      dispatch(authority, 1000);

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [ownSourceSymbol]: 1,
          },
          semanticSymbol: ownSourceSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSourceSymbol>, typeof ownSourceSymbol>>);

      dispatch(authority, 314);

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [ownSourceSymbol]: 2,
          },
          semanticSymbol: ownSourceSymbol,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof ownSourceSymbol>, typeof ownSourceSymbol>>);
    });

    it("should base output value on inputs", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();
      const ownSymbol = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceASymbol | typeof sourceBSymbol>,
            typeof sourceBSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceASymbol]: sourceA, [sourceBSymbol]: sourceB },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceASymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: { [sourceASymbol]: 0 },
          semanticSymbol: sourceASymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: "text",
          version: { [sourceASymbol]: 0, [sourceBSymbol]: 0 },
          semanticSymbol: sourceBSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceASymbol]: 0,
            [sourceBSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 500,
          version: { [sourceASymbol]: 1 },
          semanticSymbol: sourceASymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: "text",
          version: { [sourceASymbol]: 1, [sourceBSymbol]: 2 },
          semanticSymbol: sourceBSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 500,
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 2,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should skip output when value is equal according to equality comparator", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceSymbol]: source },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.value).toBe(0);

      // Toggle doubling - should go from 0 to 0 (1x0 to 2x0)
      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1); // No new call since value is equal
    });

    it("should carry over unrelated versions unchanged", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();
      const sourceCSymbol = Symbol();
      const ownSymbol = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceBSymbol | typeof sourceCSymbol>,
            typeof sourceBSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        {
          [sourceASymbol]: sourceA,
          [sourceBSymbol]: sourceB,
        },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceASymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: {
            [sourceASymbol]: 0,
          },
          semanticSymbol: sourceASymbol,
        },
      });
      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: "text",
          version: {
            [sourceBSymbol]: 0,
            [sourceCSymbol]: 1,
          },
          semanticSymbol: sourceBSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: {
            [sourceASymbol]: 0,
            [sourceBSymbol]: 0,
            [sourceCSymbol]: 1,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: "texts",
          version: {
            [sourceBSymbol]: 1000,
            [sourceCSymbol]: 42,
          },
          semanticSymbol: sourceBSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledWith({
        type: "snapshot",
        snapshot: {
          value: 100,
          version: {
            [sourceASymbol]: 0,
            [sourceBSymbol]: 1000,
            [sourceCSymbol]: 42,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });
    });

    it("should add own semantic symbol to version with unique value on every state snapshot", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceSymbol]: source },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

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

      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceSymbol]: source },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

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

    it("should store unprocessed events until first combined state snapshot", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();
      const ownSymbol = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
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
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceASymbol]: sourceA, [sourceBSymbol]: sourceB },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceASymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority, "toggle doubling");
      dispatch(authority, "toggle doubling");
      dispatch(authority, "toggle doubling");

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: { [sourceASymbol]: 0 },
          semanticSymbol: sourceASymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: "text",
          version: { [sourceBSymbol]: 0 },
          semanticSymbol: sourceBSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.value).toBe(2000);
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

      const sourceSymbol = Symbol();
      const ownSymbol = Symbol();

      const source = spawn(system, (_state, _message) => _state);

      const authority = spawnEventAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceSymbol]: source },
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        (previous, current) => previous === current,
        {
          initialSubscribersSet: Set([consumer1]),
        }
      );

      dispatch(authority, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumer1Function).toHaveBeenCalledTimes(1);
      expect(consumer1Function).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceSymbol]: 0,
            [ownSymbol]: 0,
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
      expect(consumer1Function).toHaveBeenCalledTimes(1);
      expect(consumer2Function).toHaveBeenCalledTimes(1);
      expect(consumer2Function).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceSymbol]: 0,
            [ownSymbol]: 0,
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

      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();
      const ownSymbol = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const authority1 = spawnEventAuthority<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol>,
            typeof sourceASymbol
          >;
          [sourceBSymbol]: StateSnapshot<
            string,
            Version<typeof sourceASymbol | typeof sourceBSymbol>,
            typeof sourceBSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceASymbol]: sourceA, [sourceBSymbol]: sourceB },
        async (state, _eventMessage, _lastCombinedObject) => {
          await delay(2);
          return !state;
        },
        async (state, _newCombinedObject) => {
          await delay(2);
          return state !== undefined ? state : false;
        },
        async (state, lastCombinedObject) => {
          await delay(2);
          return (state ? 2 : 1) * lastCombinedObject[sourceASymbol];
        },
        async (previous, current) => {
          await delay(2);
          return previous === current;
        },
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: { [sourceASymbol]: 0 },
          semanticSymbol: sourceASymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(authority1, {
        type: "snapshot",
        snapshot: {
          value: "text",
          version: { [sourceASymbol]: 0, [sourceBSymbol]: 0 },
          semanticSymbol: sourceBSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceASymbol]: 0,
            [sourceBSymbol]: 0,
            [ownSymbol]: 0,
          },
          semanticSymbol: ownSymbol,
        },
      });

      dispatch(authority1, {
        type: "snapshot",
        snapshot: {
          value: 500,
          version: { [sourceASymbol]: 1 },
          semanticSymbol: sourceASymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);

      dispatch(authority1, {
        type: "snapshot",
        snapshot: {
          value: "text",
          version: { [sourceASymbol]: 1, [sourceBSymbol]: 2 },
          semanticSymbol: sourceBSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 500,
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 2,
            [ownSymbol]: 1,
          },
          semanticSymbol: ownSymbol,
        },
      });

      consumerFunction.mockClear();

      const sourceSymbol = Symbol();

      const source = spawn(system, (_state, _message) => _state);

      const authority2 = spawnEventAuthority<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        typeof ownSymbol,
        boolean
      >(
        system,
        ownSymbol,
        { [sourceSymbol]: source },
        async (state, _eventMessage, _lastCombinedObject) => {
          await delay(2);
          return !state;
        },
        async (state, _newCombinedObject) => {
          await delay(2);
          return state !== undefined ? state : false;
        },
        async (state, lastCombinedObject) => {
          await delay(2);
          return (state ? 2 : 1) * lastCombinedObject[sourceSymbol];
        },
        async (previous, current) => {
          await delay(2);
          return previous === current;
        },
        {
          initialSubscribersSet: Set([consumer]),
        }
      );

      dispatch(authority2, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.value).toBe(0);

      // Toggle doubling - should go from 0 to 0 (1x0 to 2x0)
      dispatch(authority2, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1); // No new call since value is equal
    });
  });
});
