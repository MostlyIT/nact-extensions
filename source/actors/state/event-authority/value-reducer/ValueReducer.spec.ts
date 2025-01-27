import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { SnapshotMessage } from "../../../../data-types/messages/SnapshotMessage";
import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../../data-types/state-snapshot/Version";
import { delay } from "../../../../utility/__testing__/delay";
import { testRelayLike } from "../../../relay/__testing__/testRelayLike";
import { spawnValueReducer } from "./spawnValueReducer";
import { ValueReducer } from "./ValueReducer";

describe("ValueReducer", () => {
  const sourceSymbol = Symbol();
  testRelayLike<
    // @ts-expect-error
    ValueReducer<
      {
        [sourceSymbol]: StateSnapshot<
          number,
          Version<typeof sourceSymbol>,
          typeof sourceSymbol
        >;
      },
      "toggle doubling",
      number
    >,
    StateSnapshot<number, Version<typeof sourceSymbol>, undefined>
  >(
    (parent, options?) =>
      spawnValueReducer<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        boolean
      >(
        parent,
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        options
      ),
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: {
          value: { [sourceSymbol]: 1000 },
          version: { [sourceSymbol]: 0 },
          semanticSymbol: undefined,
        },
      }),
    {
      value: 1000,
      version: { [sourceSymbol]: 0 },
      semanticSymbol: undefined,
    },
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: {
          value: { [sourceSymbol]: 314 },
          version: { [sourceSymbol]: 1 },
          semanticSymbol: undefined,
        },
      }),
    {
      value: 314,
      version: { [sourceSymbol]: 1 },
      semanticSymbol: undefined,
    },
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: {
          value: { [sourceSymbol]: 1 },
          version: { [sourceSymbol]: 2 },
          semanticSymbol: undefined,
        },
      }),
    {
      value: 1,
      version: { [sourceSymbol]: 2 },
      semanticSymbol: undefined,
    }
  );

  describe("value reducing", () => {
    it("should supply the right types to the input functions", async () => {
      const system = start();

      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();
      spawnValueReducer<
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
        boolean
      >(
        system,
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
          const stateValue: boolean | undefined = state; // Type test
          const sourceAValue: number = lastCombinedObject[sourceASymbol]; // Type test
          const sourceBValue: string = lastCombinedObject[sourceBSymbol]; // Type test
          return (state ? 2 : 1) * lastCombinedObject[sourceASymbol];
        }
      );
    });

    it("should base output value on events", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const valueReducer = spawnValueReducer<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        boolean
      >(
        system,
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        {
          initialDestination: consumer,
        }
      );

      dispatch(valueReducer, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbol]: 1000,
          },
          version: {
            [sourceSymbol]: 0,
          },
          semanticSymbol: undefined,
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
          },
          semanticSymbol: undefined,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof sourceSymbol>, undefined>>);

      dispatch(valueReducer, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2000,
          version: {
            [sourceSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof sourceSymbol>, undefined>>);

      dispatch(valueReducer, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      } satisfies SnapshotMessage<StateSnapshot<number, Version<typeof sourceSymbol>, undefined>>);
    });

    it("should base output value on inputs", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const valueReducer = spawnValueReducer<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        boolean
      >(
        system,
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        {
          initialDestination: consumer,
        }
      );

      dispatch(valueReducer, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbol]: 1000,
          },
          version: {
            [sourceSymbol]: 0,
          },
          semanticSymbol: undefined,
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
          },
          semanticSymbol: undefined,
        },
      });

      dispatch(valueReducer, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbol]: 314,
          },
          version: {
            [sourceSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [sourceSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });
    });

    it("should support base", async () => {});

    it("should carry over unrelated versions unchanged", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceASymbol = Symbol();
      const sourceBSymbol = Symbol();

      const valueReducer = spawnValueReducer<
        {
          [sourceASymbol]: StateSnapshot<
            number,
            Version<typeof sourceASymbol | typeof sourceBSymbol>,
            typeof sourceASymbol
          >;
        },
        "toggle doubling",
        number,
        boolean
      >(
        system,
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceASymbol],
        {
          initialDestination: consumer,
        }
      );

      dispatch(valueReducer, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceASymbol]: 1000,
          },
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 2,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 2,
          },
          semanticSymbol: undefined,
        },
      });

      dispatch(valueReducer, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 2000,
          version: {
            [sourceASymbol]: 1,
            [sourceBSymbol]: 2,
          },
          semanticSymbol: undefined,
        },
      });
    });

    it("should not include semantic symbol in output state snapshots", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbol = Symbol();
      const valueReducer = spawnValueReducer<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        boolean
      >(
        system,
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        {
          initialDestination: consumer,
        }
      );

      dispatch(valueReducer, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbol]: 100,
          },
          version: {
            [sourceSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.semanticSymbol).toBe(
        undefined
      );

      dispatch(valueReducer, "toggle doubling");

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction.mock.calls[1][0].snapshot.semanticSymbol).toBe(
        undefined
      );
    });

    it("should store unprocessed events until first combined state snapshot", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbol = Symbol();
      const valueReducer = spawnValueReducer<
        {
          [sourceSymbol]: StateSnapshot<
            number,
            Version<typeof sourceSymbol>,
            typeof sourceSymbol
          >;
        },
        "toggle doubling",
        number,
        boolean
      >(
        system,
        (state, _eventMessage, _lastCombinedObject) => !state,
        (state, _newCombinedObject) => (state !== undefined ? state : false),
        (state, lastCombinedObject) =>
          (state ? 2 : 1) * lastCombinedObject[sourceSymbol],
        {
          initialDestination: consumer,
        }
      );

      dispatch(valueReducer, "toggle doubling");

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(valueReducer, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbol]: 100,
          },
          version: {
            [sourceSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction.mock.calls[0][0].snapshot.value).toBe(200);
    });
  });
});
