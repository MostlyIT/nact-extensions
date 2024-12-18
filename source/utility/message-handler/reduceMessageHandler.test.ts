import { describe, expect, test } from "vitest";
import { MessageHandler } from "../../message-handlers/MessageHandler";
import { combineTypeGuards } from "../types/combineTypeGuards";
import { reduceMessageHandler } from "./reduceMessageHandler";

describe("reduceMessageHandler", () => {
  // Define test types
  type AMessage = {
    type: "string";
    value: string;
  };

  const isAMessage = (message: any): message is AMessage =>
    typeof message === "object" &&
    message !== null &&
    message.type === "string" &&
    typeof message.value === "string";

  type BMessage = {
    type: "number";
    value: number;
  };

  const isBMessage = (message: any): message is AMessage =>
    typeof message === "object" &&
    message !== null &&
    message.type === "number" &&
    typeof message.value === "number";

  type TestState = {
    lastValue: any;
    processCount: number;
  };

  const createFullMessageHandler = (): MessageHandler<
    AMessage | BMessage,
    TestState
  > => ({
    handleMessage: (state, message) => ({
      lastValue: message.value,
      processCount: state.processCount + 1,
    }),
    messageTypeGuard: combineTypeGuards({ isAMessage, isBMessage }),
  });

  const initialState: TestState = {
    lastValue: null,
    processCount: 0,
  };

  describe("type guard behavior", () => {
    test("should correctly identify valid reduced messages", () => {
      const fullHandler = createFullMessageHandler();
      const reducedHandler = reduceMessageHandler(fullHandler)(isAMessage);

      expect(
        reducedHandler.messageTypeGuard({
          type: "string",
          value: "test",
        } satisfies AMessage)
      ).toBe(true);
    });

    test("should reject messages that don't match reduced type", () => {
      const fullHandler = createFullMessageHandler();
      const reducedHandler = reduceMessageHandler(fullHandler)(isAMessage);

      expect(
        reducedHandler.messageTypeGuard({
          type: "number",
          value: 42,
        } satisfies BMessage)
      ).toBe(false);
      expect(
        reducedHandler.messageTypeGuard({ type: "string", value: 42 })
      ).toBe(false);
      expect(reducedHandler.messageTypeGuard(null)).toBe(false);
      expect(reducedHandler.messageTypeGuard(undefined)).toBe(false);
      expect(reducedHandler.messageTypeGuard({})).toBe(false);
    });
  });

  describe("message handling", () => {
    test("should handle reduced messages correctly", () => {
      const fullHandler = createFullMessageHandler();
      const reducedHandler = reduceMessageHandler(fullHandler)(isAMessage);

      const result = reducedHandler.handleMessage(initialState, {
        type: "string",
        value: "test",
      });

      expect(result).toEqual({
        lastValue: "test",
        processCount: 1,
      });
    });

    test("should maintain state between multiple messages", () => {
      const fullHandler = createFullMessageHandler();
      const reducedHandler = reduceMessageHandler(fullHandler)(isAMessage);

      const state1 = reducedHandler.handleMessage(initialState, {
        type: "string",
        value: "first",
      });
      const state2 = reducedHandler.handleMessage(state1, {
        type: "string",
        value: "second",
      });

      expect(state2).toEqual({
        lastValue: "second",
        processCount: 2,
      });
    });
  });

  describe("type constraints", () => {
    test("reduced handler state type should match base handler", () => {
      const fullHandler = createFullMessageHandler();
      const reducedHandler = reduceMessageHandler(fullHandler)(isAMessage);

      type ReducedHandlerStateType = Parameters<
        typeof reducedHandler.handleMessage
      >[0];

      const validState: ReducedHandlerStateType = {
        lastValue: "test",
        processCount: 1,
      };

      // @ts-expect-error - Should not compile with missing properties
      const invalidState: ReducedHandlerStateType = {
        lastValue: "test",
      };
    });
  });
});
