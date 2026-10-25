import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CURATED_MARKET_INTELLIGENCE,
  filterMarketIntelligenceByCategory,
  searchMarketIntelligence,
  formatPublishedDate,
  fetchMarketIntelligence,
} from "../market-intelligence.ts";

describe("Market Intelligence Feed Engine (PRD §6 & SOP §9)", () => {
  it("provides comprehensive curated coverage across all four core macroeconomic categories", () => {
    assert.ok(
      CURATED_MARKET_INTELLIGENCE.length >= 7,
      "Expected at least 7 curated market intelligence reports",
    );

    const gse = filterMarketIntelligenceByCategory(CURATED_MARKET_INTELLIGENCE, "gse_ghana");
    assert.ok(gse.length >= 2, "Expected at least 2 GSE items");

    const macro = filterMarketIntelligenceByCategory(CURATED_MARKET_INTELLIGENCE, "macro_africa");
    assert.ok(macro.length >= 2, "Expected at least 2 Macro/BoG items");

    const commodities = filterMarketIntelligenceByCategory(CURATED_MARKET_INTELLIGENCE, "commodities");
    assert.ok(commodities.length >= 2, "Expected at least 2 Commodity items");

    const usGlobal = filterMarketIntelligenceByCategory(CURATED_MARKET_INTELLIGENCE, "us_global");
    assert.ok(usGlobal.length >= 1, "Expected at least 1 US/Global item");
  });

  it("filters items accurately by category and returns all for 'all'", () => {
    const all = filterMarketIntelligenceByCategory(CURATED_MARKET_INTELLIGENCE, "all");
    assert.equal(all.length, CURATED_MARKET_INTELLIGENCE.length);

    const commoditiesOnly = filterMarketIntelligenceByCategory(CURATED_MARKET_INTELLIGENCE, "commodities");
    assert.ok(commoditiesOnly.every((item) => item.category === "commodities"));
  });

  it("searches intelligence items across headlines, summaries, sources, and tags", () => {
    const inflationQuery = searchMarketIntelligence(CURATED_MARKET_INTELLIGENCE, "inflation");
    assert.ok(inflationQuery.length >= 1);
    assert.ok(inflationQuery.some((i) => i.impact_tag.includes("Inflation")));

    const bogQuery = searchMarketIntelligence(CURATED_MARKET_INTELLIGENCE, "Bank of Ghana");
    assert.ok(bogQuery.length >= 1);
    assert.equal(bogQuery[0].source_name, "Bank of Ghana (MPC Statement)");

    const emptyQuery = searchMarketIntelligence(CURATED_MARKET_INTELLIGENCE, "");
    assert.equal(emptyQuery.length, CURATED_MARKET_INTELLIGENCE.length);

    const nonExistent = searchMarketIntelligence(CURATED_MARKET_INTELLIGENCE, "quantum entanglement");
    assert.equal(nonExistent.length, 0);
  });

  it("formats relative dates and calendar timestamps cleanly", () => {
    const nowIso = new Date().toISOString();
    assert.equal(formatPublishedDate(nowIso), "Just now");

    const fiveHoursAgo = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
    assert.equal(formatPublishedDate(fiveHoursAgo), "5 hours ago");

    const twoDaysAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    assert.equal(formatPublishedDate(twoDaysAgo), "2 days ago");

    const oldDate = "2025-01-15T12:00:00Z";
    const formatted = formatPublishedDate(oldDate);
    assert.match(formatted, /2025/);
  });

  it("fetches market intelligence items with robust fallback support", async () => {
    const res = await fetchMarketIntelligence("all");
    assert.ok(res.data.length >= 7);
    assert.equal(res.error, null);

    const gseRes = await fetchMarketIntelligence("gse_ghana");
    assert.ok(gseRes.data.length >= 2);
    assert.ok(gseRes.data.every((i) => i.category === "gse_ghana"));
  });

  it("strictly enforces non-advisory compliance, verified sources, and educational takeaways", () => {
    for (const item of CURATED_MARKET_INTELLIGENCE) {
      assert.ok(
        item.educational_takeaway.length > 40,
        `Item ${item.id} must have a detailed educational takeaway`,
      );
      assert.ok(item.source_name.length > 3, `Item ${item.id} missing verified source name`);
      assert.equal(item.is_approved, true, `Item ${item.id} must be founder-approved`);

      const text = `${item.title} ${item.summary} ${item.educational_takeaway}`.toLowerCase();
      // Must not give investment/trading directives
      assert.doesNotMatch(text, /\bbuy now\b/);
      assert.doesNotMatch(text, /\bsell now\b/);
      assert.doesNotMatch(text, /\btarget price\b/);
      assert.doesNotMatch(text, /\bguaranteed profit\b/);
      assert.doesNotMatch(text, /\btrading signal\b/);
    }
  });
});

