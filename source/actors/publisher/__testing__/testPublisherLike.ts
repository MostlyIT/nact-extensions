import { Set } from "immutable";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionMessage } from "../../../data-types/messages/SubscriptionMessage";
import { delay } from "../../../utility/__testing__/delay";
import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
  start,
} from "../../../vendored/@nact/core";
import { PublisherOptions } from "../PublisherOptions";

export const testPublisherLike = <
  TPublisherLike extends LocalActorRef<SubscriptionMessage<TSnapshot>>,
  TSnapshot
>(
  publisherConstructor: (
    parent: LocalActorSystemRef | LocalActorRef<any>,
    publisherOptions?: PublisherOptions<TSnapshot>
  ) => TPublisherLike,
  causeFirstSnapshot: (publisherLike: TPublisherLike) => void,
  expectedFirstSnapshot: TSnapshot,
  causeSecondSnapshot: (publisherLike: TPublisherLike) => void,
  expectedSecondSnapshot: TSnapshot,
  causeThirdSnapshot: (publisherLike: TPublisherLike) => void,
  expectedThirdSnapshot: TSnapshot
) => {
  describe("subscribers", () => {
    it("should support initial subscriber set", async () => {
      const system = start();

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      const publisherLike = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1, consumer2]),
      });

      await delay(10);
      consumerFunction1.mockClear();
      consumerFunction2.mockClear();

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
    });

    it("should support adding subscribers", async () => {
      const system = start();

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      const consumerFunction3 = vi.fn();
      const consumer3 = spawn(system, (_state, message) =>
        consumerFunction3(message)
      );

      const publisherLike = publisherConstructor(system);

      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer1,
      });

      await delay(10);
      consumerFunction1.mockClear();

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).not.toHaveBeenCalled();
      expect(consumerFunction3).not.toHaveBeenCalled();

      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer2,
      });

      await delay(10);
      consumerFunction2.mockClear();

      causeSecondSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(2);
      expect(consumerFunction1).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });
      expect(consumerFunction3).not.toHaveBeenCalled();

      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer3,
      });

      await delay(10);
      consumerFunction3.mockClear();

      causeThirdSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(3);
      expect(consumerFunction1).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      });
      expect(consumerFunction2).toHaveBeenCalledTimes(2);
      expect(consumerFunction2).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      });
      expect(consumerFunction3).toHaveBeenCalledTimes(1);
      expect(consumerFunction3).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      });
    });

    it("should support removing subscribers", async () => {
      const system = start();

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      const publisherLike = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1]),
      });

      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer2,
      });

      await delay(10);
      consumerFunction1.mockClear();
      consumerFunction2.mockClear();

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });

      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer1,
      });

      causeSecondSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenCalledTimes(2);
      expect(consumerFunction2).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });

      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer2,
      });

      causeThirdSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenCalledTimes(2);
    });

    it("should not overreact when attempting to unsubscribe subscribers that are not subscribed", async () => {
      const system = start();

      const consumerFunction1 = vi.fn();
      const consumer1 = spawn(system, (_state, message) =>
        consumerFunction1(message)
      );

      const consumerFunction2 = vi.fn();
      const consumer2 = spawn(system, (_state, message) =>
        consumerFunction2(message)
      );

      const publisherLike = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1]),
      });

      await delay(10);
      consumerFunction1.mockClear();

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).not.toHaveBeenCalled();

      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer1,
      });

      causeSecondSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).not.toHaveBeenCalled();

      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer1,
      });
      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer2,
      });

      causeThirdSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).not.toHaveBeenCalled();
    });
  });
};
