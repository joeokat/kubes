/**
 * Expanded GSE Market Data Engine — automated tests
 * Run: node --experimental-strip-types --test src/lib/__tests__/gse-market.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  GSE_BENCHMARK_INDICES,
  GSE_TRADING_STEPS,
  getExpandedGseAssets,
  getGseAssetBySymbol,
  getGseMarketOverview,
  getGseMarketStatus,
  getGseSectorBreakdown,
} from "../gse-market.ts";

const BANNED_PHRASES = [
  /buy now/i,
  /sell now/i,
  /target price/i,
  /trading signal/i,
  /guaranteed profit/i,
  /guaranteed return/i,
  /\bstrong buy\b/i,
  /\bstrong sell\b/i,
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

describe("Expanded GSE Market Data Engine (PRD §7 & SOP §10)", () => {
  describe("GSE Benchmark Indices", () => {
    it("provides both GSE Composite Index (GSE-CI) and Financial Stock Index (GSE-FSI)", () => {
      assert.equal(GSE_BENCHMARK_INDICES.length, 2);
      const symbols = GSE_BENCHMARK_INDICES.map((i) => i.symbol);
      assert.ok(symbols.includes("GSE-CI"));
      assert.ok(symbols.includes("GSE-FSI"));
    });

    it("ensures index levels and changes are valid non-zero numbers", () => {
      for (const idx of GSE_BENCHMARK_INDICES) {
        assert.ok(idx.level > 0, `${idx.symbol} level should be positive`);
        assert.ok(typeof idx.change === "number");
        assert.ok(typeof idx.changePercent === "number");
        assert.ok(idx.description.length > 20);
        assert.ok(idx.historicalContext.length > 20);
      }
    });

    it("index educational context contains zero advisory language", () => {
      const descriptions = GSE_BENCHMARK_INDICES.flatMap((i) => [
        i.description,
        i.historicalContext,
      ]);
      assertNoAdvice(descriptions, "GSE Indices");
    });
  });

  describe("GSE Market Status & Trading Hours Logic", () => {
    it("reports 'Market Open' during weekday regular session (e.g., Wednesday 11:30 GMT)", () => {
      // Wednesday 2026-10-28 11:30 GMT
      const wednesdayOpen = new Date(Date.UTC(2026, 9, 28, 11, 30, 0));
      const status = getGseMarketStatus(wednesdayOpen);
      assert.equal(status.isOpen, true);
      assert.equal(status.statusText, "Market Open");
      assert.match(status.tradingHours, /10:00 AM/);
    });

    it("reports 'Pre-Trading Session' right before regular opening (e.g., Wednesday 09:45 GMT)", () => {
      const wednesdayPre = new Date(Date.UTC(2026, 9, 28, 9, 45, 0));
      const status = getGseMarketStatus(wednesdayPre);
      assert.equal(status.isOpen, false);
      assert.equal(status.statusText, "Pre-Trading Session");
    });

    it("reports 'Market Closed' after trading hours on weekdays (e.g., Wednesday 16:00 GMT)", () => {
      const wednesdayClosed = new Date(Date.UTC(2026, 9, 28, 16, 0, 0));
      const status = getGseMarketStatus(wednesdayClosed);
      assert.equal(status.isOpen, false);
      assert.equal(status.statusText, "Market Closed");
    });

    it("reports 'Market Closed' on weekends (e.g., Saturday 12:00 GMT)", () => {
      // Saturday 2026-10-31 12:00 GMT
      const saturday = new Date(Date.UTC(2026, 9, 31, 12, 0, 0));
      const status = getGseMarketStatus(saturday);
      assert.equal(status.isOpen, false);
      assert.equal(status.statusText, "Market Closed");
      assert.match(status.notes, /weekends/i);
    });
  });

  describe("Expanded GSE Equities Universe", () => {
    it("includes comprehensive active GSE mainboard equities across multiple sectors", () => {
      const gseAssets = getExpandedGseAssets();
      assert.ok(
        gseAssets.length >= 10,
        `Expected at least 10 GSE assets, got ${gseAssets.length}`
      );

      const symbols = gseAssets.map((a) => a.symbol);
      assert.ok(symbols.includes("MTNGH"), "Should include MTN Ghana");
      assert.ok(symbols.includes("GCB"), "Should include GCB Bank");
      assert.ok(symbols.includes("TOTAL"), "Should include TotalEnergies");
      assert.ok(symbols.includes("EGH"), "Should include Ecobank Ghana");
      assert.ok(symbols.includes("SCB"), "Should include Standard Chartered");
      assert.ok(symbols.includes("GOIL"), "Should include GOIL PLC");
      assert.ok(symbols.includes("UNIL"), "Should include Unilever Ghana");
      assert.ok(symbols.includes("FML"), "Should include Fan Milk");
      assert.ok(symbols.includes("CAL"), "Should include CalBank");
      assert.ok(symbols.includes("BOPP"), "Should include Benso Oil Palm");
      assert.ok(symbols.includes("EGL"), "Should include Enterprise Group");
    });

    it("retrieves GSE asset accurately by symbol case-insensitively", () => {
      const bopp = getGseAssetBySymbol("bopp");
      assert.ok(bopp !== undefined);
      assert.equal(bopp?.name, "Benso Oil Palm Plantation PLC");
      assert.equal(bopp?.currency, "GHS");

      const unknown = getGseAssetBySymbol("XYZFAKE");
      assert.equal(unknown, undefined);
    });

    it("strictly verifies all GSE asset educational descriptions comply with non-advisory standards", () => {
      const gseAssets = getExpandedGseAssets();
      const allTexts = gseAssets.flatMap((a) => [
        a.educationalNotes,
        ...a.riskFactors,
        a.metrics.dividendYieldOrNote || "",
      ]);
      assertNoAdvice(allTexts, "GSE Asset Descriptions");
    });
  });

  describe("GSE Sector Breakdown", () => {
    it("groups equities into distinctive economic sectors", () => {
      const sectors = getGseSectorBreakdown();
      assert.ok(sectors.length >= 4, "Should have at least 4 sectors");

      const sectorNames = sectors.map((s) => s.sector);
      assert.ok(sectorNames.includes("Commercial Banking"));
      assert.ok(sectorNames.includes("Energy Distribution"));
      assert.ok(sectorNames.includes("Telecommunications & FinTech"));
      assert.ok(sectorNames.includes("Consumer FMCG & Manufacturing"));
    });

    it("each sector has companies and educational descriptions", () => {
      const sectors = getGseSectorBreakdown();
      for (const s of sectors) {
        assert.ok(s.companiesCount > 0);
        assert.ok(s.symbols.length === s.companiesCount);
        assert.ok(s.description.length > 20);
      }
    });
  });

  describe("GSE Market Overview & Educational Trading Steps", () => {
    it("returns foundational market structure parameters", () => {
      const overview = getGseMarketOverview();
      assert.equal(overview.depository, "Central Securities Depository (CSD) Ghana LTD");
      assert.equal(overview.settlementCycle, "T+3 (Transaction day plus three business days)");
      assert.equal(overview.regulatoryBody, "Securities and Exchange Commission (SEC) Ghana");
      assert.equal(overview.tradingCurrency, "Ghana Cedi (GH₵)");
      assert.ok(overview.educationalTakeaways.length >= 3);
    });

    it("includes 4 sequential practical steps for trading in Ghana", () => {
      assert.equal(GSE_TRADING_STEPS.length, 4);
      assert.equal(GSE_TRADING_STEPS[0].step, 1);
      assert.match(GSE_TRADING_STEPS[0].title, /CSD/i);
      assert.match(GSE_TRADING_STEPS[1].title, /Stockbroker/i);
      assert.match(GSE_TRADING_STEPS[2].title, /Order/i);
      assert.match(GSE_TRADING_STEPS[3].title, /Dividends/i);
    });

    it("educational takeaways contain zero advisory language", () => {
      const overview = getGseMarketOverview();
      assertNoAdvice(overview.educationalTakeaways, "GSE Takeaways");

      const stepTexts = GSE_TRADING_STEPS.flatMap((s) => [
        s.description,
        ...s.keyDetails,
      ]);
      assertNoAdvice(stepTexts, "GSE Trading Steps");
    });
  });
});

