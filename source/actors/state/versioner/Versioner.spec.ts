import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { testRelayLike } from "../../relay/__testing__/testRelayLike";
import { spawnVersioner } from "./spawnVersioner";
import { Versioner } from "./Versioner";

describe("Versioner", () => {
  const sourceSymbol = Symbol();
  const ownSourceSymbol = Symbol();
  testRelayLike<
    // @ts-expect-error
    Versioner<number, Version<typeof sourceSymbol>, typeof ownSourceSymbol>,
    StateSnapshot<
      number,
      Version<typeof sourceSymbol | typeof ownSourceSymbol>,
      typeof ownSourceSymbol
    >
  >(
    (parent, options?) => spawnVersioner(parent, ownSourceSymbol, options),
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: {
          value: 1000,
          version: {
            [sourceSymbol]: 0,
          },
          semanticSymbol: sourceSymbol,
        },
      }),
    {
      value: 1000,
      version: {
        [sourceSymbol]: 0,
        [ownSourceSymbol]: 0,
      },
      semanticSymbol: ownSourceSymbol,
    },
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: {
          value: 314,
          version: {
            [sourceSymbol]: 1,
          },
          semanticSymbol: sourceSymbol,
        },
      }),
    {
      value: 314,
      version: {
        [sourceSymbol]: 1,
        [ownSourceSymbol]: 1,
      },
      semanticSymbol: ownSourceSymbol,
    },
    (relayLike) =>
      dispatch(relayLike, {
        type: "snapshot",
        snapshot: {
          value: 1,
          version: {
            [sourceSymbol]: 3,
          },
          semanticSymbol: sourceSymbol,
        },
      }),
    {
      value: 1,
      version: {
        [sourceSymbol]: 3,
        [ownSourceSymbol]: 2,
      },
      semanticSymbol: ownSourceSymbol,
    }
  );

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
