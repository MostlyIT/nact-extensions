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

      const publisherLike = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1, consumer2]),
      });

      await delay(10);
      const didConsumer1ReceiveInitial =
        consumerFunction1.mock.calls.length === 1;
      const didConsumer2ReceiveInitial =
        consumerFunction2.mock.calls.length === 1;
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 1 : 0
      );
      expect(consumerFunction2.mock.calls.length).toBe(
        didConsumer2ReceiveInitial ? 1 : 0
      );

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction1).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2.mock.calls.length).toBe(
        didConsumer2ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction1).toHaveBeenLastCalledWith({
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

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer1,
      });

      await delay(10);
      const didConsumer1ReceiveInitial =
        consumerFunction1.mock.calls.length === 1;

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction1).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).not.toHaveBeenCalled();
      expect(consumerFunction3).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer2,
      });

      await delay(10);
      const didConsumer2ReceiveInitial =
        consumerFunction2.mock.calls.length === 1;

      causeSecondSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 3 : 2
      );
      expect(consumerFunction1).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });
      expect(consumerFunction2.mock.calls.length).toBe(
        didConsumer2ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction2).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });
      expect(consumerFunction3).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer3,
      });

      await delay(10);
      const didConsumer3ReceiveInitial =
        consumerFunction3.mock.calls.length === 1;

      causeThirdSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 4 : 3
      );
      expect(consumerFunction1).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      });
      expect(consumerFunction2.mock.calls.length).toBe(
        didConsumer2ReceiveInitial ? 3 : 2
      );
      expect(consumerFunction2).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedThirdSnapshot,
      });
      expect(consumerFunction3.mock.calls.length).toBe(
        didConsumer3ReceiveInitial ? 2 : 1
      );
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

      const publisherLike = publisherConstructor(system, {
        initialSubscribersSet: Set([consumer1]),
      });

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "subscribe",
        subscriber: consumer2,
      });

      await delay(10);
      const didConsumer1ReceiveInitial =
        consumerFunction1.mock.calls.length === 1;
      const didConsumer2ReceiveInitial =
        consumerFunction2.mock.calls.length === 1;

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction1).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2.mock.calls.length).toBe(
        didConsumer2ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction2).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer1,
      });

      causeSecondSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction2.mock.calls.length).toBe(
        didConsumer2ReceiveInitial ? 3 : 2
      );
      expect(consumerFunction2).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedSecondSnapshot,
      });

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer2,
      });

      causeThirdSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction2.mock.calls.length).toBe(
        didConsumer2ReceiveInitial ? 3 : 2
      );
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
      const didConsumer1ReceiveInitial =
        consumerFunction1.mock.calls.length === 1;

      causeFirstSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction1).toHaveBeenLastCalledWith({
        type: "snapshot",
        snapshot: expectedFirstSnapshot,
      });
      expect(consumerFunction2).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer1,
      });

      causeSecondSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction2).not.toHaveBeenCalled();

      // @ts-expect-error
      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer1,
      });
      // @ts-expect-error
      dispatch(publisherLike, {
        type: "unsubscribe",
        subscriber: consumer2,
      });

      causeThirdSnapshot(publisherLike);

      await delay(10);
      expect(consumerFunction1.mock.calls.length).toBe(
        didConsumer1ReceiveInitial ? 2 : 1
      );
      expect(consumerFunction2).not.toHaveBeenCalled();
    });
  });
};
