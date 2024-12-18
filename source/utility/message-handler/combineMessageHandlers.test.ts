import { assertType, describe, expect, expectTypeOf, test } from "vitest";
import { MessageHandler } from "../../interfaces/MessageHandler";
import { combineMessageHandlers } from "./combineMessageHandlers";

describe("combineMessageHandlers", () => {
  // Test message types
  type StringMessage = {
    type: "string";
    value: string;
  };

  type NumberMessage = {
    type: "number";
    value: number;
  };

  type ArrayMessage = {
    type: "array";
    value: string[];
  };

  // Test state type
  type TestState = {
    lastProcessedValue: any;
    processCount: number;
  };

  // Create test message handlers
  const createStringMessageHandler = (): MessageHandler<
    StringMessage,
    TestState
  > => ({
    handleMessage: (state, message) => ({
      lastProcessedValue: message.value,
      processCount: state.processCount + 1,
    }),
    messageTypeGuard: (message: any): message is StringMessage =>
      typeof message === "object" &&
      message !== null &&
      message.type === "string" &&
      typeof message.value === "string",
  });

  const createNumberMessageHandler = (): MessageHandler<
    NumberMessage,
    TestState
  > => ({
    handleMessage: (state, message) => ({
      lastProcessedValue: message.value,
      processCount: state.processCount + 1,
    }),
    messageTypeGuard: (message: any): message is NumberMessage =>
      typeof message === "object" &&
      message !== null &&
      message.type === "number" &&
      typeof message.value === "number",
  });

  const createArrayMessageHandler = (): MessageHandler<
    ArrayMessage,
    TestState
  > => ({
    handleMessage: (state, message) => ({
      lastProcessedValue: message.value,
      processCount: state.processCount + 1,
    }),
    messageTypeGuard: (message: any): message is ArrayMessage =>
      typeof message === "object" &&
      message !== null &&
      message.type === "array" &&
      Array.isArray(message.value) &&
      message.value.every((item) => typeof item === "string"),
  });

  const initialState: TestState = {
    lastProcessedValue: null,
    processCount: 0,
  };

  describe("with single message handler", () => {
    test("should handle matching message correctly", () => {
      const handler = combineMessageHandlers({
        stringHandler: createStringMessageHandler(),
      });

      const message: StringMessage = { type: "string", value: "test" };
      const result = handler.handleMessage(initialState, message);

      expect(result).toEqual({
        lastProcessedValue: "test",
        processCount: 1,
      });
    });
  });

  describe("with multiple message handlers", () => {
    const combinedHandler = combineMessageHandlers({
      stringHandler: createStringMessageHandler(),
      numberHandler: createNumberMessageHandler(),
      arrayHandler: createArrayMessageHandler(),
    });

    test("should handle string message", () => {
      const message: StringMessage = { type: "string", value: "test" };
      const result = combinedHandler.handleMessage(initialState, message);

      expect(result).toEqual({
        lastProcessedValue: "test",
        processCount: 1,
      });
    });

    test("should handle number message", () => {
      const message: NumberMessage = { type: "number", value: 42 };
      const result = combinedHandler.handleMessage(initialState, message);

      expect(result).toEqual({
        lastProcessedValue: 42,
        processCount: 1,
      });
    });

    test("should handle array message", () => {
      const message: ArrayMessage = { type: "array", value: ["a", "b"] };
      const result = combinedHandler.handleMessage(initialState, message);

      expect(result).toEqual({
        lastProcessedValue: ["a", "b"],
        processCount: 1,
      });
    });

    test("should maintain state between multiple messages", () => {
      const state1 = combinedHandler.handleMessage(initialState, {
        type: "string",
        value: "first",
      });
      const state2 = combinedHandler.handleMessage(state1, {
        type: "number",
        value: 2,
      });
      const state3 = combinedHandler.handleMessage(state2, {
        type: "array",
        value: ["third"],
      });

      expect(state3).toEqual({
        lastProcessedValue: ["third"],
        processCount: 3,
      });
    });
  });

  describe("message type guard behavior", () => {
    const combinedHandler = combineMessageHandlers({
      stringHandler: createStringMessageHandler(),
      numberHandler: createNumberMessageHandler(),
    });

    test("should correctly identify valid messages", () => {
      expect(
        combinedHandler.messageTypeGuard({ type: "string", value: "test" })
      ).toBe(true);
      expect(
        combinedHandler.messageTypeGuard({ type: "number", value: 42 })
      ).toBe(true);
    });

    test("should reject invalid messages", () => {
      expect(combinedHandler.messageTypeGuard(null)).toBe(false);
      expect(combinedHandler.messageTypeGuard(undefined)).toBe(false);
      expect(combinedHandler.messageTypeGuard({})).toBe(false);
      expect(
        combinedHandler.messageTypeGuard({ type: "unknown", value: true })
      ).toBe(false);
      expect(
        combinedHandler.messageTypeGuard({ type: "string", value: 42 })
      ).toBe(false);
      expect(
        combinedHandler.messageTypeGuard({ type: "number", value: "42" })
      ).toBe(false);
    });
  });

  describe("with empty handlers object", () => {
    test("should reject all messages in type guard", () => {
      const handler = combineMessageHandlers({});
      expect(handler.messageTypeGuard({ type: "string", value: "test" })).toBe(
        false
      );
    });
  });

  describe("handler composition", () => {
    test("should work with nested combined handlers", () => {
      const primitiveHandler = combineMessageHandlers({
        stringHandler: createStringMessageHandler(),
        numberHandler: createNumberMessageHandler(),
      });

      const fullHandler = combineMessageHandlers({
        primitiveHandler,
        arrayHandler: createArrayMessageHandler(),
      });

      expect(
        fullHandler.handleMessage(initialState, {
          type: "string",
          value: "test",
        })
      ).toEqual({
        lastProcessedValue: "test",
        processCount: 1,
      });

      expect(
        fullHandler.handleMessage(initialState, { type: "number", value: 42 })
      ).toEqual({
        lastProcessedValue: 42,
        processCount: 1,
      });

      expect(
        fullHandler.handleMessage(initialState, {
          type: "array",
          value: ["a", "b"],
        })
      ).toEqual({
        lastProcessedValue: ["a", "b"],
        processCount: 1,
      });
    });
  });

  describe("type constraints", () => {
    test("combined handler should only accept valid message types", () => {
      const handler = combineMessageHandlers({
        stringHandler: createStringMessageHandler(),
        numberHandler: createNumberMessageHandler(),
      });

      // These should compile
      expectTypeOf(handler.handleMessage)
        .parameter(1)
        .toMatchTypeOf<StringMessage | NumberMessage>();

      // @ts-expect-error - This should not compile
      handler.handleMessage(initialState, { type: "unknown", value: true });

      type ValidMessageTypes = Parameters<typeof handler.handleMessage>[1];
      assertType<ValidMessageTypes>({ type: "string", value: "test" });
      assertType<ValidMessageTypes>({ type: "number", value: 42 });

      // @ts-expect-error - Should not compile with boolean value
      assertType<ValidMessageTypes>({ type: "string", value: true });

      // @ts-expect-error - Should not compile with unknown type
      assertType<ValidMessageTypes>({ type: "unknown", value: "test" });
    });

    test("empty handlers object should not accept any messages", () => {
      const emptyHandler = combineMessageHandlers({});

      type EmptyHandlerMessageType = Parameters<
        typeof emptyHandler.handleMessage
      >[1];

      // @ts-expect-error - Should not compile as empty handler accepts no messages
      assertType<EmptyHandlerMessageType>({ type: "string", value: "test" });

      // @ts-expect-error - Should not compile as empty handler accepts no messages
      emptyHandler.handleMessage({ type: "any", value: "test" });
    });

    test("combined handler state type should match constituent handlers", () => {
      const handler = combineMessageHandlers({
        stringHandler: createStringMessageHandler(),
        numberHandler: createNumberMessageHandler(),
      });

      expectTypeOf(handler.handleMessage)
        .parameter(0)
        .toMatchTypeOf<TestState>();

      type HandlerStateType = Parameters<typeof handler.handleMessage>[0];
      assertType<HandlerStateType>({
        lastProcessedValue: null,
        processCount: 0,
      });

      // @ts-expect-error - Should not compile with missing properties
      assertType<HandlerStateType>({
        lastProcessedValue: null,
      });
    });
  });
});
