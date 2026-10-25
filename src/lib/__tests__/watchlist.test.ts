import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CURATED_MARKET_ASSETS,
  getAvailableAssets,
  getAssetBySymbol,
  searchAssets,
  formatAssetPrice,
  formatAssetChange,
  isSymbolInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  fetchUserWatchlist,
} from "../watchlist.ts";
import type { WatchlistItem } from "../../types/watchlist.ts";

describe("Market Watchlist Engine (PRD §6 & SOP §9)", () => {
  it("provides comprehensive coverage across Ghana GSE, US markets, and Commodities", () => {
    const all = getAvailableAssets("all");
    assert.ok(all.length >= 10, "Expected at least 10 curated market assets");

    const ghStocks = getAvailableAssets("gh_stock");
    assert.ok(ghStocks.length >= 4, "Expected at least 4 GSE stocks");
    assert.ok(ghStocks.some((a) => a.symbol === "MTNGH"));
    assert.ok(ghStocks.some((a) => a.symbol === "GCB"));

    const usStocks = getAvailableAssets("us_stock");
    assert.ok(usStocks.length >= 3, "Expected at least 3 US stocks/ETFs");
    assert.ok(usStocks.some((a) => a.symbol === "VOO"));
    assert.ok(usStocks.some((a) => a.symbol === "AAPL"));

    const commodities = getAvailableAssets("commodity");
    assert.ok(commodities.length >= 3, "Expected at least 3 commodities");
    assert.ok(commodities.some((a) => a.symbol === "CC"), "Expected Cocoa commodity");
    assert.ok(commodities.some((a) => a.symbol === "XAU"), "Expected Gold commodity");
  });

  it("retrieves asset details accurately by symbol case-insensitively", () => {
    const mtnLower = getAssetBySymbol("mtngh");
    assert.ok(mtnLower);
    assert.equal(mtnLower?.symbol, "MTNGH");
    assert.equal(mtnLower?.currency, "GHS");
    assert.equal(mtnLower?.assetType, "gh_stock");

    const voo = getAssetBySymbol("VOO");
    assert.ok(voo);
    assert.equal(voo?.currency, "USD");
    assert.equal(voo?.assetType, "us_stock");

    const cocoa = getAssetBySymbol("cc");
    assert.ok(cocoa);
    assert.equal(cocoa?.name, "Cocoa");

    const invalid = getAssetBySymbol("NON_EXISTENT");
    assert.equal(invalid, null);
  });

  it("searches assets accurately by symbol, name, or sector", () => {
    const bankingResults = searchAssets("banking");
    assert.ok(bankingResults.length >= 2);
    assert.ok(bankingResults.some((a) => a.symbol === "GCB"));

    const techResults = searchAssets("apple");
    assert.equal(techResults.length, 1);
    assert.equal(techResults[0].symbol, "AAPL");

    // Search with category filter
    const ghanaEnergy = searchAssets("energy", "gh_stock");
    assert.equal(ghanaEnergy.length, 1);
    assert.equal(ghanaEnergy[0].symbol, "TOTAL");
  });

  it("formats price display with exact currency prefix and decimals", () => {
    assert.equal(formatAssetPrice(1.85, "GHS"), "GH₵1.85");
    assert.equal(formatAssetPrice(535.4, "USD"), "$535.40");
    assert.equal(formatAssetPrice(7450, "USD"), "$7,450.00");
  });

  it("formats 24h change and percentage with proper signs and polarity", () => {
    const positive = formatAssetChange(0.15, 1.55);
    assert.equal(positive.isPositive, true);
    assert.equal(positive.isNeutral, false);
    assert.equal(positive.text, "+1.55% (+0.15)");

    const negative = formatAssetChange(-0.05, -1.18);
    assert.equal(negative.isPositive, false);
    assert.equal(negative.isNeutral, false);
    assert.equal(negative.text, "-1.18% (-0.05)");

    const neutral = formatAssetChange(0.0, 0.0);
    assert.equal(neutral.isNeutral, true);
  });

  it("checks watchlist item membership correctly", () => {
    const mockWatchlist: WatchlistItem[] = [
      {
        id: "1",
        user_id: "user-123",
        symbol: "MTNGH",
        asset_type: "gh_stock",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        user_id: "user-123",
        symbol: "VOO",
        asset_type: "us_stock",
        created_at: new Date().toISOString(),
      },
    ];

    assert.equal(isSymbolInWatchlist(mockWatchlist, "MTNGH"), true);
    assert.equal(isSymbolInWatchlist(mockWatchlist, "mtngh"), true);
    assert.equal(isSymbolInWatchlist(mockWatchlist, "VOO"), true);
    assert.equal(isSymbolInWatchlist(mockWatchlist, "AAPL"), false);
  });

  it("supports adding and removing watchlist items with fallback storage", async () => {
    const testUserId = `test-user-${Date.now()}`;

    // Initial fetch should be empty
    const initial = await fetchUserWatchlist(testUserId);
    assert.equal(initial.data.length, 0);

    // Add MTNGH
    const addResult1 = await addToWatchlist(testUserId, "MTNGH", "gh_stock");
    assert.ok(addResult1.data);
    assert.equal(addResult1.data?.symbol, "MTNGH");

    // Add VOO
    const addResult2 = await addToWatchlist(testUserId, "VOO", "us_stock");
    assert.ok(addResult2.data);
    assert.equal(addResult2.data?.symbol, "VOO");

    // Fetch should now return both
    const updated = await fetchUserWatchlist(testUserId);
    assert.equal(updated.data.length, 2);
    assert.ok(updated.data.some((i) => i.symbol === "MTNGH"));
    assert.ok(updated.data.some((i) => i.symbol === "VOO"));

    // Remove MTNGH
    const removeResult = await removeFromWatchlist(testUserId, "MTNGH");
    assert.equal(removeResult.success, true);

    // Fetch should now only have VOO
    const final = await fetchUserWatchlist(testUserId);
    assert.equal(final.data.length, 1);
    assert.equal(final.data[0].symbol, "VOO");
  });

  it("strictly complies with non-advisory rules and contains zero buy/sell directives", () => {
    for (const asset of CURATED_MARKET_ASSETS) {
      const allText = `${asset.educationalNotes} ${asset.riskFactors.join(" ")}`.toLowerCase();

      // Must never give specific buy/sell directives
      assert.doesNotMatch(allText, /\bbuy now\b/);
      assert.doesNotMatch(allText, /\bsell now\b/);
      assert.doesNotMatch(allText, /\btarget price\b/);
      assert.doesNotMatch(allText, /\btrading signal\b/);
      assert.doesNotMatch(allText, /\bguaranteed return\b/);

      // Must explicitly note educational observation and risks
      assert.ok(asset.riskFactors.length >= 2, `${asset.symbol} must have at least 2 risk factors`);
      assert.ok(asset.educationalNotes.length > 50, `${asset.symbol} educational notes too short`);
    }
  });
});

