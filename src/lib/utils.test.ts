import { expect, test } from "vitest";
import { sluggify } from "./utils";
test("sluggify without spaces", () => {
  expect(sluggify("test")).toBe("test");
});
test("sluggify with spaces", () => {
  expect(sluggify("test space")).toBe("test-space");
});
test("sluggify with capital letters", () => {
  expect(sluggify("Test")).toBe("test");
});
test("sluggify untrimmed whitespace", () => {
  expect(sluggify(" test ")).toBe("test");
});
