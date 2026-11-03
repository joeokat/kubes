/**
 * Portfolio Diversification Insights — automated tests
 * Run: node --experimental-strip-types --test src/lib/__tests__/portfolio.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateDiversificationMetrics,
  validateHoldingInput,
  ASSET_CLASS_LABELS,
  ASSET_CLASS_COLORS,
} from "../portfolio.ts";
import type { PortfolioHolding } from "../../types/portfolio.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idSeq = 0;
function makeHolding(
  asset_name: string,
  asset_class: PortfolioHolding["asset_class"],
  amount_ghs: number
): PortfolioHolding {
  return {
    id: `test-${++idSeq}`,
    user_id: "user-test",
    asset_name,
    asset_class,
    amount_ghs,
    notes: null,
    created_at: new Date().toISOString(),
  };
}

const BANNED_PHRASES = [
  /buy now/i,
  /sell now/i,
  /target price/i,
  /trading signal/i,
  /guaranteed profit/i,
  /guaranteed return/i,
  /\brecommend\b/i,
];

function assertNoAdvice(texts: string[], label: string) {
  for (const text of texts) {
    for (const pattern of BANNED_PHRASES) {
      assert.doesNotMatch(
        text,
        pattern,
        `${label} contains advisory phrase matching ${pattern}: "${text}"`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 1. Empty portfolio
// ---------------------------------------------------------------------------

describe("calculateDiversificationMetrics — empty", () => {
  it("returns zero totals for empty holdings array", () => {
    const m = calculateDiversificationMetrics([]);
    assert.equal(m.totalValueGhs, 0);
    assert.equal(m.holdingsCount, 0);
    assert.equal(m.assetClassBreakdown.length, 0);
    assert.equal(m.topHolding, null);
    assert.equal(m.diversificationScore, 0);
    assert.equal(m.diversificationLevel, "High Concentration");
  });

  it("empty portfolio observations contain no advisory language", () => {
    const m = calculateDiversificationMetrics([]);
    assertNoAdvice(m.educationalObservations, "empty observations");
    assertNoAdvice(m.concentrationWarnings, "empty warnings");
  });
});

// ---------------------------------------------------------------------------
// 2. Single holding — High Concentration
// ---------------------------------------------------------------------------

describe("calculateDiversificationMetrics — single holding", () => {
  const holdings = [makeHolding("MTN Ghana", "gh_stock", 5000)];
  const m = calculateDiversificationMetrics(holdings);

  it("totalValueGhs equals holding amount", () => {
    assert.equal(m.totalValueGhs, 5000);
  });

  it("holdingsCount is 1", () => {
    assert.equal(m.holdingsCount, 1);
  });

  it("diversificationLevel is High Concentration", () => {
    assert.equal(m.diversificationLevel, "High Concentration");
  });

  it("score is less than 40 for single class", () => {
    assert.ok(
      m.diversificationScore < 40,
      `Expected score < 40, got ${m.diversificationScore}`
    );
  });

  it("assetClassBreakdown has one entry at 100%", () => {
    assert.equal(m.assetClassBreakdown.length, 1);
    assert.ok(
      Math.abs(m.assetClassBreakdown[0].percent - 100) < 0.01,
      "Single class should be 100%"
    );
  });

  it("topHolding is marked as concentrated (>25%)", () => {
    assert.ok(m.topHolding !== null);
    assert.equal(m.topHolding!.isConcentrated, true);
    assert.ok(
      Math.abs(m.topHolding!.percent - 100) < 0.01,
      "Top holding should be ~100%"
    );
  });

  it("concentration warning fires for single holding", () => {
    assert.ok(
      m.concentrationWarnings.length > 0,
      "Should have at least one concentration warning"
    );
  });

  it("observations and warnings contain no advisory language", () => {
    assertNoAdvice(m.educationalObservations, "single-holding observations");
    assertNoAdvice(m.concentrationWarnings, "single-holding warnings");
  });
});

// ---------------------------------------------------------------------------
// 3. Moderately concentrated (two classes, one >50%)
// ---------------------------------------------------------------------------

describe("calculateDiversificationMetrics — moderate concentration", () => {
  const holdings = [
    makeHolding("Stock A", "gh_stock", 7000),
    makeHolding("Bond Fund", "fixed_income", 3000),
  ];
  const m = calculateDiversificationMetrics(holdings);

  it("totalValueGhs is 10000", () => {
    assert.equal(m.totalValueGhs, 10000);
  });

  it("gh_stock percentage is 70%", () => {
    const ghAlloc = m.assetClassBreakdown.find(
      (a) => a.assetClass === "gh_stock"
    );
    assert.ok(ghAlloc, "Should have gh_stock allocation");
    assert.ok(
      Math.abs(ghAlloc!.percent - 70) < 0.01,
      `Expected 70%, got ${ghAlloc!.percent}`
    );
  });

  it("concentration warning fires for class > 50%", () => {
    assert.ok(
      m.concentrationWarnings.some((w) =>
        w.includes("GH Stocks") || w.includes("70")
      ),
      "Should warn about gh_stock concentration"
    );
  });

  it("diversificationLevel is not Well Diversified", () => {
    assert.notEqual(m.diversificationLevel, "Well Diversified");
  });

  it("no advisory language in any text", () => {
    assertNoAdvice(m.educationalObservations, "moderate observations");
    assertNoAdvice(m.concentrationWarnings, "moderate warnings");
  });
});

// ---------------------------------------------------------------------------
// 4. Well Diversified — even spread across 4+ classes
// ---------------------------------------------------------------------------

describe("calculateDiversificationMetrics — well diversified", () => {
  const holdings = [
    makeHolding("GH Equity Fund", "gh_stock", 2500),
    makeHolding("US ETF", "us_stock", 2500),
    makeHolding("Govt Bond", "fixed_income", 2500),
    makeHolding("T-Bill", "cash_equivalent", 2500),
  ];
  const m = calculateDiversificationMetrics(holdings);

  it("totalValueGhs is 10000", () => {
    assert.equal(m.totalValueGhs, 10000);
  });

  it("diversificationScore > 70 for even 4-class split", () => {
    assert.ok(
      m.diversificationScore > 70,
      `Expected score > 70, got ${m.diversificationScore}`
    );
  });

  it("diversificationLevel is Well Diversified", () => {
    assert.equal(m.diversificationLevel, "Well Diversified");
  });

  it("no concentration warnings for even 25% each", () => {
    // Each class is exactly 25% — class warning threshold is >50% so none fires.
    // Top holding is 25% — isConcentrated threshold is >25% so exactly 25 is false.
    const classWarnings = m.concentrationWarnings.filter((w) =>
      w.includes("accounts for")
    );
    assert.equal(
      classWarnings.length,
      0,
      "No class should exceed 50% threshold"
    );
  });

  it("all percentages sum to ~100", () => {
    const total = m.assetClassBreakdown.reduce((s, a) => s + a.percent, 0);
    assert.ok(
      Math.abs(total - 100) < 0.5,
      `Percentages should sum to ~100, got ${total}`
    );
  });

  it("no advisory language", () => {
    assertNoAdvice(m.educationalObservations, "diversified observations");
    assertNoAdvice(m.concentrationWarnings, "diversified warnings");
  });
});

// ---------------------------------------------------------------------------
// 5. Full 6-class portfolio (maximum diversification test)
// ---------------------------------------------------------------------------

describe("calculateDiversificationMetrics — all 6 classes", () => {
  const holdings = [
    makeHolding("GH Stock", "gh_stock", 1000),
    makeHolding("US ETF", "us_stock", 1000),
    makeHolding("Bond", "fixed_income", 1000),
    makeHolding("T-Bill", "cash_equivalent", 1000),
    makeHolding("Gold", "commodity", 1000),
    makeHolding("REIT", "real_estate", 1000),
  ];
  const m = calculateDiversificationMetrics(holdings);

  it("score is 100 for perfect 6-class even split", () => {
    assert.equal(
      m.diversificationScore,
      100,
      `Expected 100, got ${m.diversificationScore}`
    );
  });

  it("diversificationLevel is Well Diversified", () => {
    assert.equal(m.diversificationLevel, "Well Diversified");
  });

  it("all 6 classes present in breakdown", () => {
    assert.equal(m.assetClassBreakdown.length, 6);
  });
});

// ---------------------------------------------------------------------------
// 6. Percentages sum to 100 (rounding robustness)
// ---------------------------------------------------------------------------

describe("calculateDiversificationMetrics — rounding", () => {
  it("percentages sum to 100 within 0.5 tolerance for odd amounts", () => {
    const holdings = [
      makeHolding("A", "gh_stock", 333),
      makeHolding("B", "us_stock", 333),
      makeHolding("C", "fixed_income", 334),
    ];
    const m = calculateDiversificationMetrics(holdings);
    const total = m.assetClassBreakdown.reduce((s, a) => s + a.percent, 0);
    assert.ok(
      Math.abs(total - 100) < 0.5,
      `Sum was ${total}, expected ~100`
    );
  });
});

// ---------------------------------------------------------------------------
// 7. ASSET_CLASS_LABELS and ASSET_CLASS_COLORS completeness
// ---------------------------------------------------------------------------

describe("ASSET_CLASS_LABELS and ASSET_CLASS_COLORS", () => {
  const classes: PortfolioHolding["asset_class"][] = [
    "gh_stock",
    "us_stock",
    "fixed_income",
    "cash_equivalent",
    "commodity",
    "real_estate",
  ];

  it("every asset class has a label", () => {
    for (const cls of classes) {
      assert.ok(
        ASSET_CLASS_LABELS[cls],
        `Missing label for ${cls}`
      );
    }
  });

  it("every asset class has a hex color", () => {
    for (const cls of classes) {
      assert.match(
        ASSET_CLASS_COLORS[cls],
        /^#[0-9A-Fa-f]{6}$/,
        `Invalid hex color for ${cls}`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// 8. validateHoldingInput
// ---------------------------------------------------------------------------

describe("validateHoldingInput", () => {
  it("returns null for valid input", () => {
    assert.equal(
      validateHoldingInput("MTN Ghana", "gh_stock", 500),
      null
    );
  });

  it("rejects blank asset name", () => {
    assert.ok(validateHoldingInput("", "gh_stock", 500) !== null);
  });

  it("rejects whitespace-only asset name", () => {
    assert.ok(validateHoldingInput("   ", "gh_stock", 500) !== null);
  });

  it("rejects name longer than 100 chars", () => {
    assert.ok(
      validateHoldingInput("x".repeat(101), "gh_stock", 500) !== null
    );
  });

  it("rejects zero amount", () => {
    assert.ok(validateHoldingInput("Stock A", "gh_stock", 0) !== null);
  });

  it("rejects negative amount", () => {
    assert.ok(validateHoldingInput("Stock A", "gh_stock", -100) !== null);
  });

  it("rejects invalid asset class", () => {
    assert.ok(
      validateHoldingInput("Stock A", "crypto" as any, 100) !== null
    );
  });

  it("rejects amount exceeding max", () => {
    assert.ok(
      validateHoldingInput("Stock A", "gh_stock", 2_000_000_000) !== null
    );
  });

  it("accepts amount at exactly 1", () => {
    assert.equal(validateHoldingInput("Bond X", "fixed_income", 1), null);
  });
});
