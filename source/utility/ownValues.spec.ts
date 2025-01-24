import { describe, expect, it } from "vitest";
import { ownValues } from "./ownValues";

describe("ownValues", () => {
  it("should get no values from empty object", () => {
    expect(ownValues({})).toEqual([]);
  });

  it("should get values from objects with string keys", () => {
    const input1: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };
    expect(new Set(ownValues(input1))).toEqual(new Set([0, 1, 2]));

    const input2: {
      readonly [key: string]: string | null;
    } = {
      a: "a",
      b: "B",
      2: null,
    };
    expect(new Set(ownValues(input2))).toEqual(new Set(["a", "B", null]));
  });

  it("should get values from objects with symbol keys", () => {
    const symbol1 = Symbol();
    const symbol2 = Symbol();
    const symbol3 = Symbol();

    const input1: {
      readonly [key: symbol]: number;
    } = {
      [symbol1]: 0,
      [symbol2]: 1,
      [symbol3]: 2,
    };
    expect(new Set(ownValues(input1))).toEqual(new Set([0, 1, 2]));

    const input2: {
      readonly [key: symbol]: string | null;
    } = {
      [symbol1]: "a",
      [symbol2]: "B",
      [symbol3]: null,
    };
    expect(new Set(ownValues(input2))).toEqual(new Set(["a", "B", null]));
  });

  it("should get values from objects with mixed type keys", () => {
    const symbol1 = Symbol();

    const input1: {
      readonly [key: string | symbol]: number;
    } = {
      [symbol1]: 0,
      b: 1,
      2: 2,
    };
    expect(new Set(ownValues(input1))).toEqual(new Set([0, 1, 2]));

    const input2: {
      readonly [key: string | symbol]: string | null;
    } = {
      [symbol1]: "a",
      b: "B",
      2: null,
    };
    expect(new Set(ownValues(input2))).toEqual(new Set(["a", "B", null]));
  });

  it("should supply the right value type", () => {
    const input: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };

    const value = ownValues(input)[0];

    const _valueTest: number = value; // Type check
  });
});
