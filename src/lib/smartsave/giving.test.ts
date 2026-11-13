import { describe, expect, test } from "vitest";
import { givingExpense } from "./giving";

describe("virtual giving", () => {
  test("zakah is recorded as an obligation rather than optional spending", () => {
    expect(givingExpense("zakah", 25, 100, "Eligible recipient", "2026-11-13")?.necessity).toBe("need");
    expect(givingExpense("fitr", 10, 100, "Eligible recipient", "2026-11-13")?.necessity).toBe("need");
  });
  test("sadaqah stays voluntary", () => {
    expect(givingExpense("sadaqah", 10, 100, "Community support", "2026-11-13")?.necessity).toBe("want");
  });
  test("giving cannot exceed available virtual money", () => {
    expect(givingExpense("zakah", 101, 100, "Recipient", "2026-11-13")).toBeNull();
    expect(givingExpense("zakah", 100, 100, "Recipient", "2026-11-13")?.amount).toBe(100);
  });
  test("zero, negative and nonfinite amounts are rejected", () => {
    for (const amount of [0, -1, Infinity, NaN]) expect(givingExpense("sadaqah", amount, 100, "Recipient", "2026-11-13")).toBeNull();
  });
});