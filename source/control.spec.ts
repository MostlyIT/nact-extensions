import { expect, test } from "vitest";
import { control } from "./control";

test("control", () => {
  expect(control()).toBe(1);
});
