import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { delay } from "../../../utility/__testing__/delay";
import { spawnCombiner } from "./spawnCombiner";

describe("Combiner", () => {
  describe("destination", () => {
    it("should support initial destination", async () => {
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

      // Send snapshots from both sources
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
      expect(consumerFunction).toHaveBeenCalledWith({
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

    it("should support setting destination", async () => {
      const system = start();

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      const sourceSymbol = Symbol();
      const source = spawn(system, (_state, _message) => _state);

      const combiner = spawnCombiner(system, {
        [sourceSymbol]: source,
      });

      dispatch(combiner, {
        type: "set destination",
        destination: consumer1,
      });

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: { [sourceSymbol]: 100 },
          version: { [sourceSymbol]: 0 },
          semanticSymbol: undefined,
        },
      });

      dispatch(combiner, {
        type: "set destination",
        destination: consumer2,
      });

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 200,
          version: { [sourceSymbol]: 1 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: { [sourceSymbol]: 200 },
          version: { [sourceSymbol]: 1 },
          semanticSymbol: undefined,
        },
      });
    });

    it("should support unsetting destination", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const sourceSymbol = Symbol();
      const source = spawn(system, (_state, _message) => _state);

      const combiner = spawnCombiner(system, {
        [sourceSymbol]: source,
      });

      dispatch(combiner, {
        type: "set destination",
        destination: consumer,
      });

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 100,
          version: { [sourceSymbol]: 0 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);

      dispatch(combiner, {
        type: "unset destination",
      });

      dispatch(combiner, {
        type: "snapshot",
        snapshot: {
          value: 200,
          version: { [sourceSymbol]: 1 },
          semanticSymbol: sourceSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
    });
  });

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

    it("should subscribe to all provided sources on initialization", async () => {
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

      const combiner = spawnCombiner(system, {
        [sourceSymbolA]: sourceA,
        [sourceSymbolB]: sourceB,
      });

      await delay(10);

      expect(sourceASubscribeFunction).toHaveBeenCalledTimes(1);
      expect(sourceASubscribeFunction).toHaveBeenNthCalledWith(1, {
        type: "subscribe",
        // @ts-expect-error
        subscriber: combiner,
      } satisfies SubscribeMessage<any>);

      expect(sourceBSubscribeFunction).toHaveBeenCalledTimes(1);
      expect(sourceBSubscribeFunction).toHaveBeenNthCalledWith(1, {
        type: "subscribe",
        // @ts-expect-error
        subscriber: combiner,
      } satisfies SubscribeMessage<any>);
    });
  });
});
