import { start } from "@nact/core";
import { describe, it } from "vitest";
import { shouldPublishToConsumersEveryTimeTestCase } from "./__testing__/shouldPublishToConsumersEveryTimeTestCase";
import { shouldSupportInitialSubscribersSet } from "./__testing__/shouldSupportInitialSubscribersSet";
import { shouldSupportMultipleSubscribersTestCase } from "./__testing__/shouldSupportMultipleSubscribersTestCase";
import { shouldSupportPublishingTestCase } from "./__testing__/shouldSupportPublishingTestCase";
import { shouldSupportSubscribingConsumerTestCase } from "./__testing__/shouldSupportSubscribingConsumerTestCase";
import { shouldSupportUnsubscribingConsumerTestCase } from "./__testing__/shouldSupportUnsubscribingConsumerTestCase";
import { shouldSupportUnsubscribingWithMultipleConsumersTestCase } from "./__testing__/shouldSupportUnsubscribingWithMultipleConsumersTestCase";
import { spawnPublisher } from "./spawnPublisher";

describe("Publisher", () => {
  describe("publishing", () => {
    it("should support publishing", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      await shouldSupportPublishingTestCase(system, publisher);
    });

    it("should publish to consumers every time", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      await shouldPublishToConsumersEveryTimeTestCase(system, publisher);
    });
  });

  describe("subscribing", () => {
    it("should support subscribing a consumer", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      await shouldSupportSubscribingConsumerTestCase(system, publisher);
    });

    it("should support having multiple subscribers", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      await shouldSupportMultipleSubscribersTestCase(system, publisher);
    });

    it("should support initial subscribers set", async () => {
      await shouldSupportInitialSubscribersSet((parent, options) =>
        spawnPublisher(parent, options)
      );
    });
  });

  describe("unsubscribing", () => {
    it("should support unsubscribe a consumer", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      await shouldSupportUnsubscribingConsumerTestCase(system, publisher);
    });

    it("should support unsubscribing when multiple consumers are subscribed", async () => {
      const system = start();
      const publisher = spawnPublisher<number>(system);
      await shouldSupportUnsubscribingWithMultipleConsumersTestCase(
        system,
        publisher
      );
    });
  });
});
