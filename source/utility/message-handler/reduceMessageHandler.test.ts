import { describe, expect, test } from "vitest";
import { MessageHandler } from "../../interfaces/MessageHandler";
import { reduceMessageHandler } from "./reduceMessageHandler";

describe("reduceMessageHandler", () => {
  // Define test types
  type BaseMessage = {
    type: "A" | "B";
    value: string | number;
  };

  type ReducedMessage = {
    type: "A";
    value: string;
  };

  type TestState = {
    lastValue: any;
    processCount: number;
  };

  // Create a base message handler for testing
  const createBaseMessageHandler = (): MessageHandler<
    BaseMessage,
    TestState
  > => ({
    handleMessage: (state, message) => ({
      lastValue: message.value,
      processCount: state.processCount + 1,
    }),
    messageTypeGuard: (message: any): message is BaseMessage =>
      typeof message === "object" &&
      message !== null &&
      (message.type === "A" || message.type === "B") &&
      (typeof message.value === "string" || typeof message.value === "number"),
  });

  // Create a type guard for the reduced message type
  const isReducedMessage = (message: BaseMessage): message is ReducedMessage =>
    message.type === "A" && typeof message.value === "string";

  const initialState: TestState = {
    lastValue: null,
    processCount: 0,
  };

  describe("type guard behavior", () => {
    test("should correctly identify valid reduced messages", () => {
      const baseHandler = createBaseMessageHandler();
      const reducedHandler =
        reduceMessageHandler(baseHandler)(isReducedMessage);

      expect(
        reducedHandler.messageTypeGuard({ type: "A", value: "test" })
      ).toBe(true);
    });

    test("should reject messages that don't match reduced type", () => {
      const baseHandler = createBaseMessageHandler();
      const reducedHandler =
        reduceMessageHandler(baseHandler)(isReducedMessage);

      expect(
        reducedHandler.messageTypeGuard({ type: "B", value: "test" })
      ).toBe(false);
      expect(reducedHandler.messageTypeGuard({ type: "A", value: 42 })).toBe(
        false
      );
      expect(reducedHandler.messageTypeGuard(null)).toBe(false);
      expect(reducedHandler.messageTypeGuard(undefined)).toBe(false);
      expect(reducedHandler.messageTypeGuard({})).toBe(false);
    });
  });

  describe("message handling", () => {
    test("should handle reduced messages correctly", () => {
      const baseHandler = createBaseMessageHandler();
      const reducedHandler =
        reduceMessageHandler(baseHandler)(isReducedMessage);

      const message: ReducedMessage = { type: "A", value: "test" };
      const result = reducedHandler.handleMessage(initialState, message);

      expect(result).toEqual({
        lastValue: "test",
        processCount: 1,
      });
    });

    test("should maintain state between multiple messages", () => {
      const baseHandler = createBaseMessageHandler();
      const reducedHandler =
        reduceMessageHandler(baseHandler)(isReducedMessage);

      const state1 = reducedHandler.handleMessage(initialState, {
        type: "A",
        value: "first",
      });
      const state2 = reducedHandler.handleMessage(state1, {
        type: "A",
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
      const baseHandler = createBaseMessageHandler();
      const reducedHandler =
        reduceMessageHandler(baseHandler)(isReducedMessage);

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

  describe("composition", () => {
    test("should work with multiple reductions", () => {
      const baseHandler = createBaseMessageHandler();

      // First reduction to type A messages
      const typeAHandler = reduceMessageHandler(baseHandler)(
        (message): message is BaseMessage & { type: "A" } =>
          message.type === "A"
      );

      // Second reduction to type A messages with string values
      const stringTypeAHandler =
        reduceMessageHandler(typeAHandler)(isReducedMessage);

      expect(
        stringTypeAHandler.messageTypeGuard({ type: "A", value: "test" })
      ).toBe(true);
      expect(
        stringTypeAHandler.messageTypeGuard({ type: "A", value: 42 })
      ).toBe(false);
      expect(
        stringTypeAHandler.messageTypeGuard({ type: "B", value: "test" })
      ).toBe(false);
    });
  });
});
