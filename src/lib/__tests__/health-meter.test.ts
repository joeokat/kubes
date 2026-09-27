import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSavingsScore,
  calculateEmergencyScore,
  calculateSpendScore,
  calculateStabilityScore,
  determineScoreBand,
  calculateHealthScore,
  generateHealthTips,
} from "../health-meter.ts";
import type { HealthQuizInput, SpendBuckets } from "../health-meter.ts";

describe("Financial Health Meter - Calculation & Scoring", () => {
  describe("Savings Rate Scoring (0-35 points)", () => {
    it("awards 35 points for savings rate >= 20%", () => {
      assert.strictEqual(calculateSavingsScore(20), 35);
      assert.strictEqual(calculateSavingsScore(35), 35);
    });

    it("awards 28 points for savings rate between 15% and 19.9%", () => {
      assert.strictEqual(calculateSavingsScore(15), 28);
      assert.strictEqual(calculateSavingsScore(19), 28);
    });

    it("awards 20 points for savings rate between 10% and 14.9%", () => {
      assert.strictEqual(calculateSavingsScore(10), 20);
      assert.strictEqual(calculateSavingsScore(14), 20);
    });

    it("awards 12 points for savings rate between 5% and 9.9%", () => {
      assert.strictEqual(calculateSavingsScore(5), 12);
      assert.strictEqual(calculateSavingsScore(8), 12);
    });

    it("awards 5 points for modest savings > 0% but < 5%", () => {
      assert.strictEqual(calculateSavingsScore(2), 5);
    });

    it("awards 0 points for 0% or negative savings", () => {
      assert.strictEqual(calculateSavingsScore(0), 0);
      assert.strictEqual(calculateSavingsScore(-5), 0);
    });
  });

  describe("Emergency Runway Scoring (0-35 points)", () => {
    it("awards 35 points for 6+ months of emergency reserves", () => {
      assert.strictEqual(calculateEmergencyScore(6), 35);
      assert.strictEqual(calculateEmergencyScore(12), 35);
    });

    it("awards 30 points for 4.5 to 5.9 months", () => {
      assert.strictEqual(calculateEmergencyScore(4.5), 30);
      assert.strictEqual(calculateEmergencyScore(5), 30);
    });

    it("awards 25 points for 3 to 4.4 months", () => {
      assert.strictEqual(calculateEmergencyScore(3), 25);
      assert.strictEqual(calculateEmergencyScore(4), 25);
    });

    it("awards 18 points for 1.5 to 2.9 months", () => {
      assert.strictEqual(calculateEmergencyScore(1.5), 18);
      assert.strictEqual(calculateEmergencyScore(2), 18);
    });

    it("awards 12 points for 1 to 1.4 months", () => {
      assert.strictEqual(calculateEmergencyScore(1), 12);
    });

    it("awards 5 points for less than 1 month (> 0)", () => {
      assert.strictEqual(calculateEmergencyScore(0.5), 5);
    });

    it("awards 0 points for 0 months", () => {
      assert.strictEqual(calculateEmergencyScore(0), 0);
    });
  });

  describe("Spend Buckets Essentials Scoring (0-20 points)", () => {
    it("awards 20 points when essentials are <= 50%", () => {
      const buckets: SpendBuckets = { essentialsPercent: 45, discretionaryPercent: 25, debtOrOtherPercent: 30 };
      assert.strictEqual(calculateSpendScore(buckets), 20);
    });

    it("awards 17 points when essentials are between 51% and 60%", () => {
      const buckets: SpendBuckets = { essentialsPercent: 55, discretionaryPercent: 20, debtOrOtherPercent: 25 };
      assert.strictEqual(calculateSpendScore(buckets), 17);
    });

    it("awards 12 points when essentials are between 61% and 70%", () => {
      const buckets: SpendBuckets = { essentialsPercent: 65, discretionaryPercent: 20, debtOrOtherPercent: 15 };
      assert.strictEqual(calculateSpendScore(buckets), 12);
    });

    it("awards lower points as essentials consume higher percentages", () => {
      assert.strictEqual(calculateSpendScore({ essentialsPercent: 75, discretionaryPercent: 15, debtOrOtherPercent: 10 }), 8);
      assert.strictEqual(calculateSpendScore({ essentialsPercent: 85, discretionaryPercent: 10, debtOrOtherPercent: 5 }), 4);
      assert.strictEqual(calculateSpendScore({ essentialsPercent: 95, discretionaryPercent: 5, debtOrOtherPercent: 0 }), 2);
    });
  });

  describe("Income Stability Scoring (0-10 points)", () => {
    it("awards 10 points for stable income", () => {
      assert.strictEqual(calculateStabilityScore("stable"), 10);
    });

    it("awards 6 points for variable income", () => {
      assert.strictEqual(calculateStabilityScore("variable"), 6);
    });

    it("awards 3 points for unpredictable income", () => {
      assert.strictEqual(calculateStabilityScore("unpredictable"), 3);
    });
  });

  describe("Band Categorization", () => {
    it("correctly identifies Strong band (>= 75)", () => {
      assert.strictEqual(determineScoreBand(75), "Strong");
      assert.strictEqual(determineScoreBand(100), "Strong");
      assert.strictEqual(determineScoreBand(85), "Strong");
    });

    it("correctly identifies Steady band (50 - 74)", () => {
      assert.strictEqual(determineScoreBand(50), "Steady");
      assert.strictEqual(determineScoreBand(74), "Steady");
      assert.strictEqual(determineScoreBand(62), "Steady");
    });

    it("correctly identifies Building band (< 50)", () => {
      assert.strictEqual(determineScoreBand(49), "Building");
      assert.strictEqual(determineScoreBand(0), "Building");
      assert.strictEqual(determineScoreBand(30), "Building");
    });
  });

  describe("End-to-End Score Profiles", () => {
    it("calculates a perfect score for a top financial profile", () => {
      const input: HealthQuizInput = {
        incomeRange: "tier_3",
        incomeStability: "stable",
        spendBuckets: { essentialsPercent: 45, discretionaryPercent: 20, debtOrOtherPercent: 35 },
        savingsRate: 25,
        emergencyMonths: 6,
      };

      const result = calculateHealthScore(input);
      assert.strictEqual(result.score, 100);
      assert.strictEqual(result.band, "Strong");
      assert.strictEqual(result.dimensionScores.savingsScore, 35);
      assert.strictEqual(result.dimensionScores.emergencyScore, 35);
      assert.strictEqual(result.dimensionScores.spendScore, 20);
      assert.strictEqual(result.dimensionScores.stabilityScore, 10);
    });

    it("calculates Building band for a beginner with low runway", () => {
      const input: HealthQuizInput = {
        incomeRange: "tier_1",
        incomeStability: "variable",
        spendBuckets: { essentialsPercent: 80, discretionaryPercent: 15, debtOrOtherPercent: 5 },
        savingsRate: 5,
        emergencyMonths: 0.5,
      };

      const result = calculateHealthScore(input);
      // savings: 12 + emergency: 5 + spend: 8 + stability: 6 = 31
      assert.strictEqual(result.score, 31);
      assert.strictEqual(result.band, "Building");
    });

    it("calculates Steady band for a balanced intermediate profile", () => {
      const input: HealthQuizInput = {
        incomeRange: "tier_2",
        incomeStability: "variable",
        spendBuckets: { essentialsPercent: 65, discretionaryPercent: 20, debtOrOtherPercent: 15 },
        savingsRate: 10,
        emergencyMonths: 2,
      };

      const result = calculateHealthScore(input);
      // savings: 20 + emergency: 18 + spend: 12 + stability: 6 = 56 (Steady)
      assert.strictEqual(result.score, 56);
      assert.strictEqual(result.band, "Steady");
    });
  });

  describe("Educational Tips Generation", () => {
    it("generates targeted guidance without prescribing specific instruments", () => {
      const input: HealthQuizInput = {
        incomeRange: "tier_1",
        incomeStability: "unpredictable",
        spendBuckets: { essentialsPercent: 75, discretionaryPercent: 20, debtOrOtherPercent: 5 },
        savingsRate: 3,
        emergencyMonths: 1,
      };

      const result = calculateHealthScore(input);
      assert(result.tips.length >= 2, "Should provide at least two educational tips");

      // Verify non-advisory educational language
      for (const tip of result.tips) {
        assert(!tip.toLowerCase().includes("buy "), "Tips must never say 'buy <instrument>'");
        assert(!tip.toLowerCase().includes("sell "), "Tips must never say 'sell <instrument>'");
      }
    });
  });
});
