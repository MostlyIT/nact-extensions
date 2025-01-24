import { describe, expect, it } from "vitest";
import { combineVersions } from "./combineVersions";

describe("combineVersions", () => {
  const version1 = Symbol();
  const version2 = Symbol();
  const version3 = Symbol();

  it("should combine empty list of snapshots", () => {
    const result = combineVersions([]);
    expect(result).toEqual({
      type: "combined",
      value: {},
    });
  });

  it("should combine single snapshot", () => {
    const snapshot = {
      value: 42,
      version: {
        [version1]: 1,
        [version2]: 2,
      },
      semanticSymbol: undefined,
    };

    const result = combineVersions([snapshot]);
    expect(result).toEqual({
      type: "combined",
      value: {
        [version1]: 1,
        [version2]: 2,
      },
    });
  });

  it("should combine compatible snapshots with different version keys", () => {
    const snapshot1 = {
      value: 42,
      version: {
        [version1]: 1,
        [version2]: 2,
      },
      semanticSymbol: undefined,
    };

    const snapshot2 = {
      value: "test",
      version: {
        [version2]: 2,
        [version3]: 3,
      },
      semanticSymbol: undefined,
    };

    const result = combineVersions([snapshot1, snapshot2]);
    expect(result).toEqual({
      type: "combined",
      value: {
        [version1]: 1,
        [version2]: 2,
        [version3]: 3,
      },
    });
  });

  it("should detect incompatible versions", () => {
    const snapshot1 = {
      value: 42,
      version: {
        [version1]: 1,
        [version2]: 2,
      },
      semanticSymbol: undefined,
    };

    const snapshot2 = {
      value: "test",
      version: {
        [version1]: 1,
        [version2]: 3, // Different version number for version2
      },
      semanticSymbol: undefined,
    };

    const result = combineVersions([snapshot1, snapshot2]);
    expect(result).toEqual({
      type: "incompatible",
    });
  });

  it("should handle multiple snapshots with unrelated versions", () => {
    const snapshot1 = {
      value: 1,
      version: { [version1]: 1 },
      semanticSymbol: undefined,
    };

    const snapshot2 = {
      value: 2,
      version: { [version2]: 2 },
      semanticSymbol: undefined,
    };

    const snapshot3 = {
      value: 3,
      version: { [version3]: 3 },
      semanticSymbol: undefined,
    };

    const result = combineVersions([snapshot1, snapshot2, snapshot3]);
    expect(result).toEqual({
      type: "combined",
      value: {
        [version1]: 1,
        [version2]: 2,
        [version3]: 3,
      },
    });
  });

  it("should detect incompatibility across multiple snapshots", () => {
    const snapshot1 = {
      value: 1,
      version: { [version1]: 1, [version2]: 2 },
      semanticSymbol: undefined,
    };

    const snapshot2 = {
      value: 2,
      version: { [version2]: 2, [version3]: 3 },
      semanticSymbol: undefined,
    };

    const snapshot3 = {
      value: 3,
      version: { [version1]: 2 }, // Incompatible with snapshot1
      semanticSymbol: undefined,
    };

    const result = combineVersions([snapshot1, snapshot2, snapshot3]);
    expect(result).toEqual({
      type: "incompatible",
    });
  });
});
