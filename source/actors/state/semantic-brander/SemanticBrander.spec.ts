import { dispatch, spawn, start } from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { StateSnapshot } from "../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../data-types/state-snapshot/Version";
import { delay } from "../../../utility/__testing__/delay";
import { testRelayLike } from "../../relay/__testing__/testRelayLike";
import { SemanticBrander } from "./SemanticBrander";
import { spawnSemanticBrander } from "./spawnSemanticBrander";

describe("SemanticBrander", () => {
  {
    const sourceSymbol = Symbol();
    const ownSourceSymbol = Symbol();
    testRelayLike<
      // @ts-expect-error
      SemanticBrander<
        number,
        Version<typeof sourceSymbol>,
        typeof ownSourceSymbol
      >,
      StateSnapshot<
        number,
        Version<typeof sourceSymbol>,
        typeof ownSourceSymbol
      >
    >(
      (parent, options?) =>
        spawnSemanticBrander(parent, ownSourceSymbol, options),
      (relayLike) =>
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: 1000,
            version: {
              [sourceSymbol]: 0,
            },
            semanticSymbol: undefined,
          },
        }),
      {
        value: 1000,
        version: {
          [sourceSymbol]: 0,
        },
        semanticSymbol: ownSourceSymbol,
      },
      (relayLike) =>
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: 314,
            version: {
              [sourceSymbol]: 2,
            },
            semanticSymbol: sourceSymbol,
          },
        }),
      {
        value: 314,
        version: {
          [sourceSymbol]: 2,
        },
        semanticSymbol: ownSourceSymbol,
      },
      (relayLike) =>
        dispatch(relayLike, {
          type: "snapshot",
          snapshot: {
            value: 1,
            version: {
              [sourceSymbol]: 5,
            },
            semanticSymbol: undefined,
          },
        }),
      {
        value: 1,
        version: {
          [sourceSymbol]: 5,
        },
        semanticSymbol: ownSourceSymbol,
      }
    );
  }

  describe("semantic branding", () => {
    it("should brand with the right semantic symbol", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const semanticSymbol = Symbol();
      const ownSemanticSymbol = Symbol();
      const semanticBrander = spawnSemanticBrander<
        number,
        Version<typeof semanticSymbol>,
        typeof ownSemanticSymbol
      >(system, ownSemanticSymbol, {
        initialDestination: consumer,
      });

      dispatch(semanticBrander, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [semanticSymbol]: 0,
          },
          semanticSymbol: semanticSymbol,
        },
      });
      dispatch(semanticBrander, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [semanticSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction).toHaveBeenCalledTimes(2);
      expect(consumerFunction.mock.calls[0][0].snapshot.semanticSymbol).toBe(
        ownSemanticSymbol
      );
      expect(consumerFunction.mock.calls[1][0].snapshot.semanticSymbol).toBe(
        ownSemanticSymbol
      );
    });

    it("should carry over value unchanged", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const semanticSymbol = Symbol();
      const ownSemanticSymbol = Symbol();
      const semanticBrander = spawnSemanticBrander<
        number,
        Version<typeof semanticSymbol>,
        typeof ownSemanticSymbol
      >(system, ownSemanticSymbol, {
        initialDestination: consumer,
      });

      dispatch(semanticBrander, {
        type: "snapshot",
        snapshot: {
          value: 10,
          version: {
            [semanticSymbol]: 0,
          },
          semanticSymbol: undefined,
        },
      });
      dispatch(semanticBrander, {
        type: "snapshot",
        snapshot: {
          value: 11,
          version: {
            [semanticSymbol]: 1,
          },
          semanticSymbol: undefined,
        },
      });

      await delay(10);
      expect(consumerFunction.mock.calls[0][0].snapshot.value).toBe(10);
      expect(consumerFunction.mock.calls[1][0].snapshot.value).toBe(11);
    });

    it("should carry over versions unchanged", async () => {
      const system = start();

      const consumerFunction = vi.fn();
      const consumer = spawn(system, (_state, message) =>
        consumerFunction(message)
      );

      const symbolA = Symbol();
      const symbolB = Symbol();
      const ownSymbol = Symbol();
      const semanticBrander = spawnSemanticBrander(system, ownSymbol, {
        initialDestination: consumer,
      });

      dispatch(semanticBrander, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [symbolA]: 0,
          },
          semanticSymbol: symbolA,
        },
      });
      dispatch(semanticBrander, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [symbolB]: 0,
          },
          semanticSymbol: symbolB,
        },
      });
      dispatch(semanticBrander, {
        type: "snapshot",
        snapshot: {
          value: 0,
          version: {
            [symbolA]: 1,
            [symbolB]: 1,
          },
          semanticSymbol: undefined,
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
  });
});
