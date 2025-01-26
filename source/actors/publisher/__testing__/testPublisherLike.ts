import {
  dispatch,
  LocalActorRef,
  LocalActorSystemRef,
  spawn,
  start,
} from "@nact/core";
import { Set } from "immutable";
import { describe, expect, it, vi } from "vitest";
import { SubscribeMessage } from "../../../data-types/messages/SubscribeMessage";
import { UnsubscribeMessage } from "../../../data-types/messages/UnsubscribeMessage";
import { delay } from "../../../utility/__testing__/delay";
import { PublisherOptions } from "../PublisherOptions";

export const testPublisherLike = <
  TPublisherLike extends LocalActorRef<
    SubscribeMessage<TSnapshot> | UnsubscribeMessage<TSnapshot>
  >,
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

      const publisher = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1, consumer2]),
      });

      await delay(10);
      expect(consumerFunction1).not.toHaveBeenCalled();
      expect(consumerFunction2).not.toHaveBeenCalled();

      causeFirstSnapshot(publisher);

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

      const publisher = publisherConstructor(system);

      // @ts-expect-error
      dispatch(publisher, {
        type: "subscribe",
        subscriber: consumer1,
      });

      causeFirstSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).not.toHaveBeenCalled();
      expect(consumerFunction3).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisher, {
        type: "subscribe",
        subscriber: consumer2,
      });

      causeSecondSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(2);
      expect(consumerFunction1).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });
      expect(consumerFunction2.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(consumerFunction2).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });
      expect(consumerFunction3).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisher, {
        type: "subscribe",
        subscriber: consumer3,
      });

      causeThirdSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(3);
      expect(consumerFunction1).toHaveBeenNthCalledWith(3, {
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      });
      expect(consumerFunction2.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(consumerFunction2).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      });
      expect(consumerFunction3.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(consumerFunction3).toHaveBeenLastCalledWith({
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

      const publisher = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1]),
      });

      // @ts-expect-error
      dispatch(publisher, {
        type: "subscribe",
        subscriber: consumer2,
      });

      causeFirstSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });

      // @ts-expect-error
      dispatch(publisher, {
        type: "unsubscribe",
        subscriber: consumer1,
      });

      causeSecondSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).toHaveBeenCalledTimes(2);
      expect(consumerFunction2).toHaveBeenNthCalledWith(2, {
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });

      // @ts-expect-error
      dispatch(publisher, {
        type: "unsubscribe",
        subscriber: consumer2,
      });

      causeThirdSnapshot(publisher);

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

      const publisher = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1]),
      });

      causeFirstSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction1).toHaveBeenNthCalledWith(1, {
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisher, {
        type: "unsubscribe",
        subscriber: consumer1,
      });

      causeSecondSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisher, {
        type: "unsubscribe",
        subscriber: consumer1,
      });
      // @ts-expect-error
      dispatch(publisher, {
        type: "unsubscribe",
        subscriber: consumer2,
      });

      causeThirdSnapshot(publisher);

      await delay(10);
      expect(consumerFunction1).toHaveBeenCalledTimes(1);
      expect(consumerFunction2).not.toHaveBeenCalled();
    });
  });
};
