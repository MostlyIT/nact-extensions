import { start } from "@nact/core";
import { describe, it } from "vitest";
import { shouldPublishToConsumersEveryTimeTestCase } from "../publisher/__testing__/shouldPublishToConsumersEveryTimeTestCase";
import { shouldSupportInitialSubscribersSet } from "../publisher/__testing__/shouldSupportInitialSubscribersSet";
import { shouldSupportMultipleSubscribersTestCase } from "../publisher/__testing__/shouldSupportMultipleSubscribersTestCase";
import { shouldSupportPublishingTestCase } from "../publisher/__testing__/shouldSupportPublishingTestCase";
import { shouldSupportSubscribingConsumerTestCase } from "../publisher/__testing__/shouldSupportSubscribingConsumerTestCase";
import { shouldSupportUnsubscribingConsumerTestCase } from "../publisher/__testing__/shouldSupportUnsubscribingConsumerTestCase";
import { shouldSupportUnsubscribingWithMultipleConsumersTestCase } from "../publisher/__testing__/shouldSupportUnsubscribingWithMultipleConsumersTestCase";
import { shouldReplayMessagesToNewSubscribersTestCase } from "./__testing__/shouldReplayMessagesToNewSubscribersTestCase";
import { spawnReplayPublisher } from "./spawnReplayPublisher";

describe("spawnReplayPublisher", () => {
  describe("publishing", () => {
    it("should support publishing", async () => {
      const system = start();
      const replayPublisher = spawnReplayPublisher<number>(system, 0);
      await shouldSupportPublishingTestCase(system, replayPublisher);
    });

    it("should publish to consumers every time", async () => {
      const system = start();
      const replayPublisher = spawnReplayPublisher<number>(system, 1);
      await shouldPublishToConsumersEveryTimeTestCase(system, replayPublisher);
    });
  });

  describe("replaying", () => {
    it("should replay messages to new subscribers", async () => {
      const system = start();
      const replayPublisher = spawnReplayPublisher<number>(system, 2);
      await shouldReplayMessagesToNewSubscribersTestCase(
        system,
        replayPublisher
      );
    });
  });

  describe("subscribing", () => {
    it("should support subscribing a consumer", async () => {
      const system = start();
      const replayPublisher = spawnReplayPublisher<number>(system, 0);
      await shouldSupportSubscribingConsumerTestCase(system, replayPublisher);
    });

    it("should support having multiple subscribers", async () => {
      const system = start();
      const replayPublisher = spawnReplayPublisher<number>(system, 3);
      await shouldSupportMultipleSubscribersTestCase(system, replayPublisher);
    });

    it("should support initial subscribers set", async () => {
      await shouldSupportInitialSubscribersSet((parent, options) =>
        spawnReplayPublisher(parent, 2, options)
      );
    });
  });

  describe("unsubscribing", () => {
    it("should support unsubscribe a consumer", async () => {
      const system = start();
      const replayPublisher = spawnReplayPublisher<number>(system, 4);
      await shouldSupportUnsubscribingConsumerTestCase(system, replayPublisher);
    });

    it("should support unsubscribing when multiple consumers are subscribed", async () => {
      const system = start();
      const replayPublisher = spawnReplayPublisher<number>(system, 5);
      await shouldSupportUnsubscribingWithMultipleConsumersTestCase(
        system,
        replayPublisher
      );
    });
  });
});
