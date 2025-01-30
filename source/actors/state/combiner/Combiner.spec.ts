import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { testRelayLike } from "../../relay/__testing__/testRelayLike";
import { Combiner } from "./Combiner";
import { spawnCombiner } from "./spawnCombiner";

describe("Combiner", () => {
  {
    const sourceSymbolA = Symbol();
    const sourceSymbolB = Symbol();
    testRelayLike<
      // @ts-expect-error
      Combiner<{
        readonly [sourceSymbolA]: StateSnapshot<
          number,
          Version<typeof sourceSymbolA>,
          typeof sourceSymbolA
        >;
        readonly [sourceSymbolB]: StateSnapshot<
          string,
          Version<typeof sourceSymbolB>,
          typeof sourceSymbolB
        >;
      }>,
      StateSnapshot<
        {
          readonly [sourceSymbolA]: number;
          readonly [sourceSymbolB]: string;
        },
        Version<typeof sourceSymbolA | typeof sourceSymbolB>,
        undefined
      >
    >(
      (parent, options?) => {
        const sourceA = spawn(parent, (_state, _message) => _state);
        const sourceB = spawn(parent, (_state, _message) => _state);

        return spawnCombiner(
          parent,
          {
            [sourceSymbolA]: sourceA,
            [sourceSymbolB]: sourceB,
          },
          options
        );
      },
      (relayLike) => {
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: 100,
            version: { [sourceSymbolA]: 0 },
            semanticSymbol: sourceSymbolA,
          },
        });
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: "hello",
            version: { [sourceSymbolB]: 0 },
            semanticSymbol: sourceSymbolB,
          },
        });
      },
      {
        value: {
          [sourceSymbolA]: 100,
          [sourceSymbolB]: "hello",
        },
        version: {
          [sourceSymbolA]: 0,
          [sourceSymbolB]: 0,
        },
        semanticSymbol: undefined,
      },
      (relayLike) => {
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: 314,
            version: { [sourceSymbolA]: 1 },
            semanticSymbol: sourceSymbolA,
          },
        });
      },
      {
        value: {
          [sourceSymbolA]: 314,
          [sourceSymbolB]: "hello",
        },
        version: {
          [sourceSymbolA]: 1,
          [sourceSymbolB]: 0,
        },
        semanticSymbol: undefined,
      },
      (relayLike) => {
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: "test",
            version: { [sourceSymbolB]: 1 },
            semanticSymbol: sourceSymbolB,
          },
        });
      },
      {
        value: {
          [sourceSymbolA]: 314,
          [sourceSymbolB]: "test",
        },
        version: {
          [sourceSymbolA]: 1,
          [sourceSymbolB]: 1,
        },
        semanticSymbol: undefined,
      }
    );
  }

  describe("combining", () => {
    it("should combine state snapshots from multiple sources", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbolA = Symbol();
      const sourceSymbolB = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const combiner = spawnCombiner(
        system,
        {
          [sourceSymbolA]: sourceA,
          [sourceSymbolB]: sourceB,
        },
        {
          initialDestination: consumer,
        }
      );

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      // Send snapshots in different order
      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: "hello",
          version: { [sourceSymbolB]: 0 },
          semanticSymbol: sourceSymbolB,
        },
      });

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbolA]: 0 },
          semanticSymbol: sourceSymbolA,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbolA]: 100,
            [sourceSymbolB]: "hello",
          },
          version: {
            [sourceSymbolA]: 0,
            [sourceSymbolB]: 0,
          },
          semanticSymbol: undefined,
        },
      });
    });

    it("should not emit until all sources have provided a snapshot", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbolA = Symbol();
      const sourceSymbolB = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const combiner = spawnCombiner(
        system,
        {
          [sourceSymbolA]: sourceA,
          [sourceSymbolB]: sourceB,
        },
        {
          initialDestination: consumer,
        }
      );

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbolA]: 0 },
          semanticSymbol: sourceSymbolA,
        },
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: "hello",
          version: { [sourceSymbolB]: 0 },
          semanticSymbol: sourceSymbolB,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
    });

    it("should handle incompatible versions", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbolA = Symbol();
      const sourceSymbolB = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const combiner = spawnCombiner(
        system,
        {
          [sourceSymbolA]: sourceA,
          [sourceSymbolB]: sourceB,
        },
        {
          initialDestination: consumer,
        }
      );

      // Send snapshots with incompatible versions
      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbolA]: 0, [sourceSymbolB]: 1 }, // Extra version
          semanticSymbol: sourceSymbolA,
        },
      });

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: "hello",
          version: { [sourceSymbolB]: 0 },
          semanticSymbol: sourceSymbolB,
        },
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();
    });

    it("should update combined state when sources send new snapshots", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbolA = Symbol();
      const sourceSymbolB = Symbol();

      const sourceA = spawn(system, (_state, _message) => _state);
      const sourceB = spawn(system, (_state, _message) => _state);

      const combiner = spawnCombiner(
        system,
        {
          [sourceSymbolA]: sourceA,
          [sourceSymbolB]: sourceB,
        },
        {
          initialDestination: consumer,
        }
      );

      // Initial snapshots
      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbolA]: 0 },
          semanticSymbol: sourceSymbolA,
        },
      });

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: "hello",
          version: { [sourceSymbolB]: 0 },
          semanticSymbol: sourceSymbolB,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);

      // Update from source A
      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 200,
          version: { [sourceSymbolA]: 1 },
          semanticSymbol: sourceSymbolA,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbolA]: 200,
            [sourceSymbolB]: "hello",
          },
          version: {
            [sourceSymbolA]: 1,
            [sourceSymbolB]: 0,
          },
          semanticSymbol: undefined,
        },
      });

      // Update from source B
      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: "world",
          version: { [sourceSymbolB]: 1 },
          semanticSymbol: sourceSymbolB,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(consumerFunction).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: {
          value: {
            [sourceSymbolA]: 200,
            [sourceSymbolB]: "world",
          },
          version: {
            [sourceSymbolA]: 1,
            [sourceSymbolB]: 1,
          },
          semanticSymbol: undefined,
        },
      });
    });

    it("should not subscribe to any provided sources on initialization", async () => {
      const system = start();

      const sourceASubscribeFunction = vi.fn();
      const sourceA = spawn(system, (_state, message) => {
        if (message.type === "subscribe") {
          sourceASubscribeFunction(message);
        }
        return _state;
      });

      const sourceBSubscribeFunction = vi.fn();
      const sourceB = spawn(system, (_state, message) => {
        if (message.type === "subscribe") {
          sourceBSubscribeFunction(message);
        }
        return _state;
      });

      const sourceSymbolA = Symbol();
      const sourceSymbolB = Symbol();

      spawnCombiner(system, {
        [sourceSymbolA]: sourceA,
        [sourceSymbolB]: sourceB,
      });

      await delay(10);
      expect(sourceASubscribeFunction).not.toHaveBeenCalled();
      expect(sourceBSubscribeFunction).not.toHaveBeenCalled();
    });
  });
});
