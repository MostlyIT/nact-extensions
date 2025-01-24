import { describe, expect, it } from "vitest";
import { ownKeys } from "./ownKeys";

describe("ownKeys", () => {
  it("should get no keys from empty object", () => {
    expect(new Set(ownKeys({}))).toEqual(new Set());
  });

  it("should get keys from objects with string keys", () => {
    const input1: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };
    expect(new Set(ownKeys(input1))).toEqual(new Set(["a", "b", "2"]));

    const input2: {
      readonly [key: string]: string | null;
    } = {
      a: "a",
      b: "B",
      2: null,
    };
    expect(new Set(ownKeys(input2))).toEqual(new Set(["a", "b", "2"]));
  });

  it("should get keys from objects with symbol keys", () => {
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
    expect(new Set(ownKeys(input1))).toEqual(
      new Set([symbol1, symbol2, symbol3])
    );

    const input2: {
      readonly [key: symbol]: string | null;
    } = {
      [symbol1]: "a",
      [symbol2]: "B",
      [symbol3]: null,
    };
    expect(new Set(ownKeys(input2))).toEqual(
      new Set([symbol1, symbol2, symbol3])
    );
  });

  it("should get keys from objects with mixed type keys", () => {
    const symbol1 = Symbol();

    const input1: {
      readonly [key: string | symbol]: number;
    } = {
      [symbol1]: 0,
      b: 1,
      2: 2,
    };
    expect(new Set(ownKeys(input1))).toEqual(new Set([symbol1, "b", "2"]));

    const input2: {
      readonly [key: string | symbol]: string | null;
    } = {
      [symbol1]: "a",
      b: "B",
      2: null,
    };
    expect(new Set(ownKeys(input2))).toEqual(new Set([symbol1, "b", "2"]));
  });

  it("should supply the right key type", () => {
    const input: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };

    const [key] = ownKeys(input);

    const _keyTest: string = key;
  });
});
