import { describe, expect, test } from "vitest";
import { TypeGuard } from "./TypeGuard";
import { combineTypeGuards } from "./combineTypeGuards";

describe("combineTypeGuards", () => {
  // Test type guards
  const isString: TypeGuard<string> = (candidate: any): candidate is string =>
    typeof candidate === "string";

  const isNumber: TypeGuard<number> = (candidate: any): candidate is number =>
    typeof candidate === "number";

  const isStringArray: TypeGuard<string[]> = (
    candidate: any
  ): candidate is string[] =>
    Array.isArray(candidate) &&
    candidate.every((item) => typeof item === "string");

  describe("with single type guard", () => {
    test("should return true when the single type guard matches", () => {
      const combined = combineTypeGuards({ isString });
      expect(combined("test")).toBe(true);
    });

    test("should return false when the single type guard does not match", () => {
      const combined = combineTypeGuards({ isString });
      expect(combined(42)).toBe(false);
    });
  });

  describe("with multiple type guards", () => {
    const combined = combineTypeGuards({
      isString,
      isNumber,
      isStringArray,
    });

    test("should return true when any type guard matches", () => {
      expect(combined("test")).toBe(true);
      expect(combined(42)).toBe(true);
      expect(combined(["a", "b", "c"])).toBe(true);
    });

    test("should return false when no type guard matches", () => {
      expect(combined({})).toBe(false);
      expect(combined(null)).toBe(false);
      expect(combined(undefined)).toBe(false);
      expect(combined([1, 2, 3])).toBe(false);
      expect(combined(true)).toBe(false);
    });
  });

  describe("with empty type guards object", () => {
    test("should return false for any input", () => {
      const combined = combineTypeGuards({});
      expect(combined("test")).toBe(false);
      expect(combined(42)).toBe(false);
      expect(combined(null)).toBe(false);
      expect(combined({})).toBe(false);
    });
  });

  describe("type guard composition", () => {
    test("should work with nested combined type guards", () => {
      const numberOrString = combineTypeGuards({
        isString,
        isNumber,
      });

      const arrayOrPrimitive = combineTypeGuards({
        isStringArray,
        primitiveGuard: numberOrString,
      });

      expect(arrayOrPrimitive("test")).toBe(true);
      expect(arrayOrPrimitive(42)).toBe(true);
      expect(arrayOrPrimitive(["a", "b"])).toBe(true);
      expect(arrayOrPrimitive({})).toBe(false);
      expect(arrayOrPrimitive([1, 2])).toBe(false);
    });
  });
});
