import { describe, expect, it, vi } from "vitest";
import { mapValues } from "./mapValues";
import { ownKeys } from "./ownKeys";

describe("mapValues", () => {
  it("should map the empty object correctly", () => {
    const mapper = vi.fn();

    expect(mapValues({}, mapper)).toEqual({});
    expect(mapper).not.toHaveBeenCalled();
  });

  it("should map objects correctly with string keys", () => {
    const input1: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };
    expect(mapValues(input1, (value) => value * value)).toEqual({
      a: 0,
      b: 1,
      2: 4,
    });

    const input2: {
      readonly [key: string]: string | null;
    } = {
      a: "a",
      b: "B",
      2: null,
    };
    expect(
      mapValues(input2, (value) =>
        value !== null ? "letter " + value.toUpperCase() : null
      )
    ).toEqual({
      a: "letter A",
      b: "letter B",
      2: null,
    });
  });

  it("should map objects correctly with symbol keys", () => {
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
    expect(mapValues(input1, (value) => value * value)).toEqual({
      [symbol1]: 0,
      [symbol2]: 1,
      [symbol3]: 4,
    });

    const input2: {
      readonly [key: symbol]: string | null;
    } = {
      [symbol1]: "a",
      [symbol2]: "B",
      [symbol3]: null,
    };
    expect(
      mapValues(input2, (value) =>
        value !== null ? "letter " + value.toUpperCase() : null
      )
    ).toEqual({
      [symbol1]: "letter A",
      [symbol2]: "letter B",
      [symbol3]: null,
    });
  });

  it("should map objects correctly with mixed type keys", () => {
    const symbol1 = Symbol();

    const input1: {
      readonly [key: string | symbol]: number;
    } = {
      [symbol1]: 0,
      b: 1,
      2: 2,
    };
    expect(mapValues(input1, (value) => value * value)).toEqual({
      [symbol1]: 0,
      b: 1,
      2: 4,
    });

    const input2: {
      readonly [key: string | symbol]: string | null;
    } = {
      [symbol1]: "a",
      b: "B",
      2: null,
    };
    expect(
      mapValues(input2, (value) =>
        value !== null ? "letter " + value.toUpperCase() : null
      )
    ).toEqual({
      [symbol1]: "letter A",
      b: "letter B",
      2: null,
    });
  });

  it("should supply the right value, key, and object to the value mapper function", () => {
    const symbol = Symbol();

    const input: {
      readonly [key: string | symbol]: number;
    } = {
      [symbol]: 100,
      text: 200,
    };

    const consumer = vi.fn();

    mapValues(input, consumer);

    expect(consumer).toHaveBeenCalledTimes(2);
    expect(consumer).toHaveBeenCalledWith(100, symbol, input);
    expect(consumer).toHaveBeenCalledWith(200, "text", input);
  });

  it("should have correct types in value mapper", () => {
    const input: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };

    mapValues(input, (value, key, object) => {
      const _valueTest: number = value;
      const _keyTest: string = key;
      const _objectTest: {
        readonly [key: string]: number;
      } = object;
    });
  });

  it("should supply the right key and value types", () => {
    const input: {
      readonly [key: string]: number;
    } = {
      a: 0,
      b: 1,
      2: 2,
    };

    const result = mapValues(input, (value) => value * value);
    const key = ownKeys(result)[0];
    const value = result[key];

    const _keyTest: string = key;
    const _valueTest: number = value;
  });
});
