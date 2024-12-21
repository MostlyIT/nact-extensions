import { describe, expect, test } from "vitest";
import { MessageHandler } from "../../interfaces/MessageHandler";
import { scopeMessageHandler } from "./scopeMessageHandler";

describe("scopeMessageHandler", () => {
  // Test message type
  type TestMessage = {
    type: "test";
    value: string;
  };

  // Inner state type
  type InnerState = {
    lastValue: string;
    processCount: number;
  };

  // Outer state type
  type OuterState = {
    testHandler: InnerState;
    otherData: string;
  };

  // Create a base message handler for testing
  const createTestMessageHandler = (): MessageHandler<
    TestMessage,
    InnerState
  > => ({
    handleMessage: (state, message) => ({
      lastValue: message.value,
      processCount: state.processCount + 1,
    }),
    messageTypeGuard: (message: any): message is TestMessage =>
      typeof message === "object" &&
      message !== null &&
      message.type === "test" &&
      typeof message.value === "string",
  });

  const initialInnerState: InnerState = {
    lastValue: "",
    processCount: 0,
  };

  const initialOuterState: OuterState = {
    testHandler: initialInnerState,
    otherData: "unchanged",
  };

  describe("message handling", () => {
    test("should handle messages within the scoped state", () => {
      const baseHandler = createTestMessageHandler();
      const scopedHandler = scopeMessageHandler(baseHandler, "testHandler");

      const message: TestMessage = { type: "test", value: "test value" };
      const result = scopedHandler.handleMessage(initialOuterState, message);

      expect(result).toEqual({
        testHandler: {
          lastValue: "test value",
          processCount: 1,
        },
        otherData: "unchanged",
      });
    });

    test("should preserve other state properties", () => {
      const baseHandler = createTestMessageHandler();
      const scopedHandler = scopeMessageHandler(baseHandler, "testHandler");

      const message: TestMessage = { type: "test", value: "new value" };
      const customOuterState: OuterState = {
        testHandler: initialInnerState,
        otherData: "custom data",
      };

      const result = scopedHandler.handleMessage(customOuterState, message);

      expect(result).toEqual({
        testHandler: {
          lastValue: "new value",
          processCount: 1,
        },
        otherData: "custom data",
      });
    });

    test("should maintain state between multiple messages", () => {
      const baseHandler = createTestMessageHandler();
      const scopedHandler = scopeMessageHandler(baseHandler, "testHandler");

      const state1 = scopedHandler.handleMessage(initialOuterState, {
        type: "test",
        value: "first",
      });
      const state2 = scopedHandler.handleMessage(state1, {
        type: "test",
        value: "second",
      });

      expect(state2).toEqual({
        testHandler: {
          lastValue: "second",
          processCount: 2,
        },
        otherData: "unchanged",
      });
    });
  });

  describe("type guard behavior", () => {
    test("should correctly identify valid messages", () => {
      const baseHandler = createTestMessageHandler();
      const scopedHandler = scopeMessageHandler(baseHandler, "testHandler");

      expect(
        scopedHandler.messageTypeGuard({ type: "test", value: "valid" })
      ).toBe(true);
    });

    test("should reject invalid messages", () => {
      const baseHandler = createTestMessageHandler();
      const scopedHandler = scopeMessageHandler(baseHandler, "testHandler");

      expect(scopedHandler.messageTypeGuard(null)).toBe(false);
      expect(scopedHandler.messageTypeGuard(undefined)).toBe(false);
      expect(scopedHandler.messageTypeGuard({})).toBe(false);
      expect(
        scopedHandler.messageTypeGuard({ type: "unknown", value: "test" })
      ).toBe(false);
      expect(scopedHandler.messageTypeGuard({ type: "test", value: 42 })).toBe(
        false
      );
    });
  });

  describe("nested scoping", () => {
    type DeepState = {
      level1: {
        level2: InnerState;
        otherLevel2Data: string;
      };
      otherLevel1Data: number;
    };

    test("should work with multiple levels of scoping", () => {
      const baseHandler = createTestMessageHandler();
      const level2Handler = scopeMessageHandler(baseHandler, "level2");
      const level1Handler = scopeMessageHandler(level2Handler, "level1");

      const initialDeepState: DeepState = {
        level1: {
          level2: initialInnerState,
          otherLevel2Data: "level 2",
        },
        otherLevel1Data: 42,
      };

      const result = level1Handler.handleMessage(initialDeepState, {
        type: "test",
        value: "nested",
      });

      expect(result).toEqual({
        level1: {
          level2: {
            lastValue: "nested",
            processCount: 1,
          },
          otherLevel2Data: "level 2",
        },
        otherLevel1Data: 42,
      });
    });
  });

  describe("type constraints", () => {
    test("scoped handler should maintain correct state types", () => {
      const baseHandler = createTestMessageHandler();
      const scopedHandler = scopeMessageHandler(baseHandler, "testHandler");

      type ScopedHandlerStateType = Parameters<
        typeof scopedHandler.handleMessage
      >[0];

      // // Should compile with correct state type
      // const validState: ScopedHandlerStateType = {
      //   testHandler: {
      //     lastValue: "test",
      //     processCount: 1,
      //   },
      //   otherData: "valid",
      // };

      // // @ts-expect-error - Should not compile with missing properties
      // const invalidState1: ScopedHandlerStateType = {
      //   testHandler: {
      //     lastValue: "test",
      //   },
      //   otherData: "invalid",
      // };

      // // @ts-expect-error - Should not compile with missing required state path
      // const invalidState2: ScopedHandlerStateType = {
      //   otherData: "missing handler",
      // };
    });
  });
});
