import { describe, expect, it } from "vitest";
import { areVersionsEqual } from "./areVersionsEqual";

describe("areVersionsEqual", () => {
  it("should return true for identical versions", () => {
    expect(areVersionsEqual({}, {})).toBe(true);

    const symbol = Symbol();
    expect(areVersionsEqual({ [symbol]: 1 }, { [symbol]: 1 })).toBe(true);

    const symbol1 = Symbol();
    const symbol2 = Symbol();
    expect(
      areVersionsEqual(
        { [symbol1]: 1, [symbol2]: 2 },
        { [symbol1]: 1, [symbol2]: 2 }
      )
    ).toBe(true);
  });

  it("should return false for versions with different values", () => {
    const symbol = Symbol();
    expect(areVersionsEqual({ [symbol]: 1 }, { [symbol]: 2 })).toBe(false);
  });

  it("should return false for versions with different keys", () => {
    const symbol1 = Symbol();
    const symbol2 = Symbol();
    expect(areVersionsEqual({ [symbol1]: 1 }, { [symbol2]: 1 })).toBe(false);
  });

  it("should return false for versions with different number of keys", () => {
    const symbol = Symbol();
    expect(areVersionsEqual({}, { [symbol]: 1 })).toBe(false);
    expect(areVersionsEqual({ [symbol]: 1 }, {})).toBe(false);

    const symbol1 = Symbol();
    const symbol2 = Symbol();
    expect(
      areVersionsEqual({ [symbol1]: 1 }, { [symbol1]: 1, [symbol2]: 2 })
    ).toBe(false);
  });

  it("should handle versions with mixed types of values", () => {
    const symbol1 = Symbol();
    const symbol2 = Symbol();
    const version1 = { [symbol1]: 0, [symbol2]: 1 };
    const version2 = { [symbol1]: 0, [symbol2]: 1 };
    expect(areVersionsEqual(version1, version2)).toBe(true);
  });
});
