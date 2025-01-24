import { describe, expect, it } from "vitest";
import { entries } from "./entries";

describe("entries", () => {
  it("should get no entries from empty object", () => {
    expect(entries({})).toEqual([]);
  });

  it("should get entries from objects with string keys", () => {
    const input1: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };
    expect(new Set(entries(input1))).toEqual(
      new Set([
        ["a", 0],
        ["b", 1],
        ["2", 2],
      ])
    );

    const input2: {
      readonly [key: string]: string | null;
    } = {
      a: "a",
      b: "B",
      2: null,
    };
    expect(new Set(entries(input2))).toEqual(
      new Set([
        ["a", "a"],
        ["b", "B"],
        ["2", null],
      ])
    );
  });

  it("should get entries from objects with symbol keys", () => {
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
    expect(new Set(entries(input1))).toEqual(
      new Set([
        [symbol1, 0],
        [symbol2, 1],
        [symbol3, 2],
      ])
    );

    const input2: {
      readonly [key: symbol]: string | null;
    } = {
      [symbol1]: "a",
      [symbol2]: "B",
      [symbol3]: null,
    };
    expect(new Set(entries(input2))).toEqual(
      new Set([
        [symbol1, "a"],
        [symbol2, "B"],
        [symbol3, null],
      ])
    );
  });

  it("should get entries from objects with mixed type keys", () => {
    const symbol1 = Symbol();

    const input1: {
      readonly [key: string | symbol]: number;
    } = {
      [symbol1]: 0,
      b: 1,
      2: 2,
    };
    expect(new Set(entries(input1))).toEqual(
      new Set([
        [symbol1, 0],
        ["b", 1],
        ["2", 2],
      ])
    );

    const input2: {
      readonly [key: string | symbol]: string | null;
    } = {
      [symbol1]: "a",
      b: "B",
      2: null,
    };
    expect(new Set(entries(input2))).toEqual(
      new Set([
        [symbol1, "a"],
        ["b", "B"],
        ["2", null],
      ])
    );
  });

  it("should supply the right entry types", () => {
    const input: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };

    const [key, value] = entries(input)[0];

    const _keyTest: string = key; // Type check
    const _valueTest: number = value; // Type check
  });
});
