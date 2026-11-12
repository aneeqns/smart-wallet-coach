import { describe, expect, test } from "vitest";
import { shariahTopic } from "./shariah";
import { forecastGoal } from "./whatif";

describe("Shariah financial boundaries", () => {
  test("interest-based requests are handled before ordinary savings advice", () => {
    expect(shariahTopic("How do I reach my goal using compound interest?")).toBe("riba");
    expect(shariahTopic("Should I use an APY savings account?")).toBe("riba");
  });
  test("gambling requests are handled before spending advice", () => {
    expect(shariahTopic("Can I save faster by betting?")).toBe("gambling");
    expect(shariahTopic("Spend on lottery tickets?")).toBe("gambling");
  });
  test("zakat questions cannot become an ordinary balance-based suggestion", () => {
    expect(shariahTopic("How much zakat do I owe on my balance?")).toBe("zakat");
  });
  test("specific product permissibility is separated from ordinary budgeting", () => {
    expect(shariahTopic("Is this investment halal?")).toBe("permissibility");
    expect(shariahTopic("Where is my money going?")).toBeNull();
  });
  test("goal forecasts use contributions only, with no interest growth", () => {
    const goal = { id: "test", name: "Laptop", emoji: "💻", target: 1000, saved: 200 };
    expect(forecastGoal(goal, 20)?.weeks).toBe(40);
    expect(forecastGoal(goal, 40)?.weeks).toBe(20);
    expect(forecastGoal(goal, 0)?.weeks).toBeNull();
  });
});