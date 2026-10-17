import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BudgetCategory, BudgetFramework, Expense } from "../budget.ts";
import {
    calculateCategoryBudget,
    calculateCategorySpend,
    calculateSpendMeterStatus,
    DEFAULT_FOUNDER_CATEGORIES,
    generateBudgetRecommendations,
    generateBudgetWarnings,
    STANDARD_50_30_20_CATEGORIES,
    validateFrameworkCategories,
} from "../budget.ts";

describe("Expense Tracker & Budgeting Engine", () => {
  describe("Framework Percentage Validation", () => {
    it("validates founder's 55/5/10/15/15 model as exactly 100%", () => {
      const res = validateFrameworkCategories(DEFAULT_FOUNDER_CATEGORIES);
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.sum, 100);
    });

    it("validates standard 50/30/20 model as exactly 100%", () => {
      const res = validateFrameworkCategories(STANDARD_50_30_20_CATEGORIES);
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.sum, 100);
    });

    it("rejects category allocations that do not sum to 100%", () => {
      const invalidCategories: BudgetCategory[] = [
        { id: "1", label: "Cat 1", percent: 40, color: "#000", icon: "🏠" },
        { id: "2", label: "Cat 2", percent: 50, color: "#000", icon: "🍿" },
      ]; // Sum = 90%
      const res = validateFrameworkCategories(invalidCategories);
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.sum, 90);
      assert(res.error?.includes("100%"));
    });
  });

  describe("Category Budget Arithmetic", () => {
    it("calculates exact dollar/cedi allocations for 3000 monthly income", () => {
      assert.strictEqual(calculateCategoryBudget(3000, 55), 1650);
      assert.strictEqual(calculateCategoryBudget(3000, 5), 150);
      assert.strictEqual(calculateCategoryBudget(3000, 10), 300);
      assert.strictEqual(calculateCategoryBudget(3000, 15), 450);
    });

    it("handles zero and negative income gracefully without NaN", () => {
      assert.strictEqual(calculateCategoryBudget(0, 50), 0);
      assert.strictEqual(calculateCategoryBudget(-500, 50), 0);
    });
  });

  describe("Category Spend Aggregation", () => {
    it("aggregates expenses for matching category case-insensitively", () => {
      const expenses: Expense[] = [
        {
          user_id: "u1",
          amount: 120.5,
          category_label: "Essentials (55%)",
          spent_at: "2026-10-01",
        },
        {
          user_id: "u1",
          amount: 80.0,
          category_label: "essentials (55%)",
          spent_at: "2026-10-02",
        },
        {
          user_id: "u1",
          amount: 45.0,
          category_label: "Free Spending (5%)",
          spent_at: "2026-10-02",
        },
      ];

      const essentialsSpend = calculateCategorySpend(
        expenses,
        "Essentials (55%)",
      );
      assert.strictEqual(essentialsSpend, 200.5);

      const freeSpend = calculateCategorySpend(expenses, "Free Spending (5%)");
      assert.strictEqual(freeSpend, 45.0);

      const emptySpend = calculateCategorySpend(expenses, "Unused Category");
      assert.strictEqual(emptySpend, 0);
    });
  });

  describe("Spending Meter Thresholds", () => {
    it("classifies <= 80% as 'under'", () => {
      assert.strictEqual(calculateSpendMeterStatus(500, 1000), "under");
      assert.strictEqual(calculateSpendMeterStatus(800, 1000), "under");
    });

    it("classifies > 80% and <= 100% as 'near'", () => {
      assert.strictEqual(calculateSpendMeterStatus(850, 1000), "near");
      assert.strictEqual(calculateSpendMeterStatus(1000, 1000), "near");
    });

    it("classifies > 100% as 'over'", () => {
      assert.strictEqual(calculateSpendMeterStatus(1001, 1000), "over");
      assert.strictEqual(calculateSpendMeterStatus(1400, 1000), "over");
    });
  });

  describe("Overspend Warnings & Plain-Language Recommendations", () => {
    const testFramework: BudgetFramework = {
      name: "Founder Model",
      categories: DEFAULT_FOUNDER_CATEGORIES,
      is_active: true,
    };
    const income = 3000; // Free spending is 5% = 150 allocation

    it("generates warning when category exceeds allocation", () => {
      const expenses: Expense[] = [
        // Free spending budget is 150. Spend 210 -> 60 over (40% overspend)
        {
          user_id: "u1",
          amount: 210,
          category_label: "Free Spending (5%)",
          spent_at: "2026-10-01",
        },
        // Essentials budget is 1650. Spend 500 -> under
        {
          user_id: "u1",
          amount: 500,
          category_label: "Essentials (55%)",
          spent_at: "2026-10-01",
        },
      ];

      const warnings = generateBudgetWarnings(testFramework, income, expenses);
      assert.strictEqual(warnings.length, 1);
      assert.strictEqual(warnings[0].categoryLabel, "Free Spending (5%)");
      assert.strictEqual(warnings[0].allocatedAmount, 150);
      assert.strictEqual(warnings[0].spentAmount, 210);
      assert.strictEqual(warnings[0].overspendAmount, 60);
      assert.strictEqual(warnings[0].overspendPercentage, 40);
    });

    it("produces compliant educational recommendations without investment advice", () => {
      const expenses: Expense[] = [
        {
          user_id: "u1",
          amount: 250,
          category_label: "Free Spending (5%)",
          spent_at: "2026-10-01",
        },
      ];

      const recommendations = generateBudgetRecommendations(
        testFramework,
        income,
        expenses,
      );
      assert(recommendations.length > 0, "Should generate recommendations");

      for (const rec of recommendations) {
        assert(
          !rec.toLowerCase().includes("buy "),
          "Must not give investment advice",
        );
        assert(
          !rec.toLowerCase().includes("sell "),
          "Must not give investment advice",
        );
      }
    });
  });
});
