import {
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
  start,
  stop,
} from "@nact/core";
import { describe, expect, it, vi } from "vitest";
import { SubscribeMessage } from "../../../../data-types/messages/SubscribeMessage";
import { StateSnapshot } from "../../../../data-types/state-snapshot/StateSnapshot";
import { Version } from "../../../../data-types/state-snapshot/Version";
import { delay } from "../../../../utility/__testing__/delay";
import { CombinerOwnOptions } from "../CombinerOptions";

export const testCombinerLike = <TCombinerLike extends LocalActorRef<any>>(
  combinerConstructor: (
    parent: LocalActorSystemRef | LocalActorRef<any>,
    stateSnapshotSources: {
      readonly [key in symbol]: LocalActorRef<
        SubscribeMessage<StateSnapshot<any, Version<key>, key>>
      >;
    },
    combinerOptions?: CombinerOwnOptions
  ) => TCombinerLike
) => {
  describe("combiner-like", () => {
    it("should support manage own subscriptions option", async () => {
      const system = start();

      const sourceASubscribeFunction = vi.fn();
      const sourceA = spawn(system, (_state, message) => {
        switch (message.type) {
          case "subscribe":
          case "unsubscribe":
            sourceASubscribeFunction(message);
        }
        return _state;
      });

      const sourceBSubscribeFunction = vi.fn();
      const sourceB = spawn(system, (_state, message) => {
        switch (message.type) {
          case "subscribe":
          case "unsubscribe":
            sourceBSubscribeFunction(message);
        }
        return _state;
      });

      const sourceSymbolA = Symbol();
      const sourceSymbolB = Symbol();

      combinerConstructor(system, {
        [sourceSymbolA]: sourceA,
        [sourceSymbolB]: sourceB,
      });

      combinerConstructor(
        system,
        {
          [sourceSymbolA]: sourceA,
          [sourceSymbolB]: sourceB,
        },
        {
          manageOwnSubscriptions: false,
        }
      );

      await delay(10);
      expect(sourceASubscribeFunction).not.toHaveBeenCalled();
      expect(sourceBSubscribeFunction).not.toHaveBeenCalled();

      const subscribingCombinerLike = combinerConstructor(
        system,
        {
          [sourceSymbolA]: sourceA,
          [sourceSymbolB]: sourceB,
        },
        {
          manageOwnSubscriptions: true,
        }
      );

      await delay(10);
      expect(sourceASubscribeFunction).toHaveBeenCalledTimes(1);
      expect(sourceASubscribeFunction).toHaveBeenNthCalledWith(1, {
        type: "subscribe",
        subscriber: subscribingCombinerLike,
      });
      expect(sourceBSubscribeFunction).toHaveBeenCalledTimes(1);
      expect(sourceBSubscribeFunction).toHaveBeenNthCalledWith(1, {
        type: "subscribe",
        subscriber: subscribingCombinerLike,
      });

      stop(subscribingCombinerLike);

      await delay(10);
      expect(sourceASubscribeFunction).toHaveBeenCalledTimes(2);
      expect(sourceASubscribeFunction).toHaveBeenNthCalledWith(2, {
        type: "unsubscribe",
        subscriber: subscribingCombinerLike,
      });
      expect(sourceBSubscribeFunction).toHaveBeenCalledTimes(2);
      expect(sourceBSubscribeFunction).toHaveBeenNthCalledWith(2, {
        type: "unsubscribe",
        subscriber: subscribingCombinerLike,
      });
    });
  });
};
