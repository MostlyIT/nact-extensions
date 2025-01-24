import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { spawnVersioner } from "./spawnVersioner";
import { OutputSnapshotMessageOfVersioner } from "./Versioner";

describe("Versioner", () => {
  describe("destination", () => {
    it("should support initial destination", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const someOtherSymbol = Symbol();
      const versionerSymbol = Symbol();
      const versioner = spawnVersioner<
        number,
        { [someOtherSymbol]: number },
        typeof versionerSymbol
      >(system, versionerSymbol, {
        initialDestination: consumer,
      });

      await delay(10);
      expect(consumerFunction).not.toHaveBeenCalled();

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [someOtherSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [someOtherSymbol]: 0,
            [versionerSymbol]: 0,
          },
          semanticSymbol: versionerSymbol,
        },
      } satisfies OutputSnapshotMessageOfVersioner<typeof versioner>);

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [someOtherSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [someOtherSymbol]: 1,
            [versionerSymbol]: 1,
          },
          semanticSymbol: versionerSymbol,
        },
      } satisfies OutputSnapshotMessageOfVersioner<typeof versioner>);
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

      const someOtherSymbol = Symbol();
      const versionerSymbol = Symbol();
      const versioner = spawnVersioner<
        number,
        { [someOtherSymbol]: number },
        typeof versionerSymbol
      >(system, versionerSymbol);

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [someOtherSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });

      dispatch(versioner, {
        type: "set destination",
        destination: consumer1,
      });

      await delay(10);
      expect(consumerFunction1).not.toHaveBeenCalled();

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [someOtherSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [someOtherSymbol]: 1,
            [versionerSymbol]: 1,
          },
          semanticSymbol: versionerSymbol,
        },
      } satisfies OutputSnapshotMessageOfVersioner<typeof versioner>);

      dispatch(versioner, {
        type: "set destination",
        destination: consumer2,
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).not.toHaveBeenCalled();

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 12,
          version: {
            [someOtherSymbol]: 2,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 12,
          version: {
            [someOtherSymbol]: 2,
            [versionerSymbol]: 2,
          },
          semanticSymbol: versionerSymbol,
        },
      } satisfies OutputSnapshotMessageOfVersioner<typeof versioner>);
    });

    it("should support unsetting destination", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const someOtherSymbol = Symbol();
      const versionerSymbol = Symbol();
      const versioner = spawnVersioner<
        number,
        { [someOtherSymbol]: number },
        typeof versionerSymbol
      >(system, versionerSymbol);

      dispatch(versioner, {
        type: "set destination",
        destination: consumer,
      });
      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [someOtherSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
      expect(consumerFunction).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [someOtherSymbol]: 0,
            [versionerSymbol]: 0,
          },
          semanticSymbol: versionerSymbol,
        },
      } satisfies OutputSnapshotMessageOfVersioner<typeof versioner>);

      dispatch(versioner, {
        type: "unset destination",
      });
      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [someOtherSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe("versioning", () => {
    it("should brand with the right semantic symbol", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const someOtherSymbol = Symbol();
      const versionerSymbol = Symbol();
      const versioner = spawnVersioner<
        number,
        Version<typeof someOtherSymbol>,
        typeof versionerSymbol
      >(system, versionerSymbol, {
        initialDestination: consumer,
      });

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [someOtherSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });
      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [someOtherSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction.mock.calls[0][0].snapshot.semanticSymbol).toBe(
        versionerSymbol
      );
      expect(consumerFunction.mock.calls[1][0].snapshot.semanticSymbol).toBe(
        versionerSymbol
      );
    });

    it("should carry over value unchanged", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const someOtherSymbol = Symbol();
      const versionerSymbol = Symbol();
      const versioner = spawnVersioner<
        number,
        Version<typeof someOtherSymbol>,
        typeof versionerSymbol
      >(system, versionerSymbol, {
        initialDestination: consumer,
      });

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [someOtherSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });
      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [someOtherSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction.mock.calls[0][0].snapshot.value).toBe(10);
      expect(consumerFunction.mock.calls[1][0].snapshot.value).toBe(11);
    });

    it("should carry over versions unrelated to its own", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const symbolA = Symbol();
      const symbolB = Symbol();
      const versionerSymbol = Symbol();
      const versioner = spawnVersioner(system, versionerSymbol, {
        initialDestination: consumer,
      });

      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [symbolA]: 0,
          },
          semanticSymbol: versionerSymbol,
        },
      });
      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [symbolB]: 0,
          },
          semanticSymbol: versionerSymbol,
        },
      });
      dispatch(versioner, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [symbolA]: 1,
            [symbolB]: 1,
          },
          semanticSymbol: versionerSymbol,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);

      expect(consumerFunction.mock.calls[0][0].snapshot.version[symbolA]).toBe(
        0
      );
      expect(
        consumerFunction.mock.calls[0][0].snapshot.version[symbolB]
      ).not.toBeDefined();

      expect(
        consumerFunction.mock.calls[1][0].snapshot.version[symbolA]
      ).not.toBeDefined();
      expect(consumerFunction.mock.calls[1][0].snapshot.version[symbolB]).toBe(
        0
      );

      expect(consumerFunction.mock.calls[2][0].snapshot.version[symbolA]).toBe(
        1
      );
      expect(consumerFunction.mock.calls[2][0].snapshot.version[symbolB]).toBe(
        1
      );
    });

    it("should produce a new version with every snapshot", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const someOtherSymbol = Symbol();
      const versionerSymbol = Symbol();
      const versioner = spawnVersioner<
        number,
        Version<typeof someOtherSymbol>,
        typeof versionerSymbol
      >(system, versionerSymbol, {
        initialDestination: consumer,
      });

      [0, 1, 10].forEach((value, index) => {
        dispatch(versioner, {
          type: "snapshot",
          snapshot: {
            value: value,
            version: {
              [someOtherSymbol]: index,
            },
            semanticSymbol: undefined,
          },
        });
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(3);
      expect(
        new Set(
          consumerFunction.mock.calls.map(
            (call) => call[0].snapshot.version[versionerSymbol]
          )
        ).size
      ).toBe(3);
    });
  });
});
