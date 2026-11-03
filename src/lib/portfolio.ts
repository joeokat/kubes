/**
 * Portfolio Diversification Insights Engine
 *
 * All insights use universal educational framing only.
 * This module NEVER recommends specific instruments, gives buy/sell signals,
 * or promises any return. See SOP §7 and §10.
 */
import type {
  AssetClassAllocation,
  DiversificationLevel,
  DiversificationMetrics,
  PortfolioAssetClass,
  PortfolioHolding,
  TopHoldingConcentration,
} from "../types/portfolio";

// ---------------------------------------------------------------------------
// Asset-class metadata (labels + brand colours)
// ---------------------------------------------------------------------------

export const ASSET_CLASS_LABELS: Record<PortfolioAssetClass, string> = {
  gh_stock: "GH Stocks (GSE)",
  us_stock: "US Equities / ETFs",
  fixed_income: "Fixed Income / Bonds",
  cash_equivalent: "Cash & Equivalents",
  commodity: "Commodities",
  real_estate: "Real Estate",
};

export const ASSET_CLASS_COLORS: Record<PortfolioAssetClass, string> = {
  gh_stock: "#0066CC",
  us_stock: "#00AA88",
  fixed_income: "#FF8C00",
  cash_equivalent: "#6B7280",
  commodity: "#C2410C",
  real_estate: "#7C3AED",
};

// ---------------------------------------------------------------------------
// Diversification scoring (Herfindahl-inspired, inverted)
//
// Herfindahl–Hirschman Index (HHI) = sum of squared weight fractions (0–1).
// Pure HHI = 1 when single class owns 100%, 1/N when perfectly even across N.
// We invert and normalise so:
//   score 100 = perfectly even across all 6 classes
//   score 0   = 100 % in one class
// ---------------------------------------------------------------------------

function herfindahlScore(allocations: AssetClassAllocation[]): number {
  if (allocations.length === 0) return 0;
  const hhi = allocations.reduce((sum, a) => {
    const w = a.percent / 100;
    return sum + w * w;
  }, 0);
  // Normalise: min possible HHI with N classes = 1/N; max = 1
  const n = 6; // fixed universe of 6 asset classes
  const hhiMin = 1 / n;
  // score = 1 - (hhi - hhiMin) / (1 - hhiMin) then * 100
  const raw = 1 - (hhi - hhiMin) / (1 - hhiMin);
  return Math.round(Math.max(0, Math.min(100, raw * 100)));
}

function diversificationLevel(score: number): DiversificationLevel {
  if (score > 70) return "Well Diversified";
  if (score >= 40) return "Moderate Spread";
  return "High Concentration";
}

// ---------------------------------------------------------------------------
// Educational observations (generic — no specific instrument recommendations)
// ---------------------------------------------------------------------------

function buildObservations(
  breakdown: AssetClassAllocation[],
  score: number
): string[] {
  const obs: string[] = [];
  const classCount = breakdown.length;

  if (classCount === 0) {
    obs.push(
      "Adding your first holding will let you see how your portfolio is distributed across asset classes."
    );
    return obs;
  }

  if (classCount === 1) {
    obs.push(
      "Your portfolio currently holds a single asset class. Spreading holdings across multiple asset classes is a common strategy investors use to manage risk."
    );
  } else if (classCount === 2) {
    obs.push(
      "Holding two asset classes is a start. Many investors aim for broader spread across three or more categories to reduce reliance on any one area."
    );
  } else {
    obs.push(
      `Your portfolio spans ${classCount} asset class${classCount > 1 ? "es" : ""}. Broader spread across asset categories is generally associated with lower concentration risk in educational finance literature.`
    );
  }

  const hasCash = breakdown.some((a) => a.assetClass === "cash_equivalent");
  if (!hasCash) {
    obs.push(
      "Cash or cash-equivalent holdings (e.g. money market funds, T-bills) can act as a liquidity buffer — a concept commonly discussed in introductory personal finance."
    );
  }

  const hasFixedIncome = breakdown.some(
    (a) => a.assetClass === "fixed_income"
  );
  if (!hasFixedIncome && classCount < 4) {
    obs.push(
      "Fixed-income instruments (bonds, treasury notes) have historically behaved differently from equities in many market environments — a property called low or negative correlation that diversification theory builds on."
    );
  }

  if (score > 70) {
    obs.push(
      "A broad spread across asset classes is often highlighted in finance education as a key principle of portfolio construction."
    );
  }

  obs.push(
    "Remember: diversification does not guarantee a profit or protect against loss in declining markets. This information is educational only."
  );

  return obs;
}

// ---------------------------------------------------------------------------
// Concentration warnings (educational framing, no advice)
// ---------------------------------------------------------------------------

function buildWarnings(
  breakdown: AssetClassAllocation[],
  topHolding: TopHoldingConcentration | null
): string[] {
  const warnings: string[] = [];

  for (const a of breakdown) {
    if (a.percent > 50) {
      warnings.push(
        `${a.label} accounts for ${a.percent.toFixed(1)}% of your portfolio. High concentration in a single asset class generally increases exposure to that class's specific risks — a concept covered in basic investing education.`
      );
    }
  }

  if (topHolding && topHolding.isConcentrated) {
    warnings.push(
      `"${topHolding.assetName}" represents ${topHolding.percent.toFixed(1)}% of your total portfolio. Holding a large share in a single asset is widely discussed as concentration risk in introductory investing courses.`
    );
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Core calculation (pure function — no I/O)
// ---------------------------------------------------------------------------

export function calculateDiversificationMetrics(
  holdings: PortfolioHolding[]
): DiversificationMetrics {
  if (holdings.length === 0) {
    return {
      totalValueGhs: 0,
      holdingsCount: 0,
      assetClassBreakdown: [],
      topHolding: null,
      diversificationScore: 0,
      diversificationLevel: "High Concentration",
      educationalObservations: buildObservations([], 0),
      concentrationWarnings: [],
    };
  }

  // Sum total value
  const totalValueGhs = holdings.reduce((s, h) => s + h.amount_ghs, 0);

  // Group by asset class
  const classMap = new Map<
    PortfolioAssetClass,
    { total: number; count: number }
  >();
  for (const h of holdings) {
    const existing = classMap.get(h.asset_class) ?? { total: 0, count: 0 };
    classMap.set(h.asset_class, {
      total: existing.total + h.amount_ghs,
      count: existing.count + 1,
    });
  }

  const assetClassBreakdown: AssetClassAllocation[] = Array.from(
    classMap.entries()
  )
    .sort((a, b) => b[1].total - a[1].total) // largest first
    .map(([cls, { total, count }]) => ({
      assetClass: cls,
      label: ASSET_CLASS_LABELS[cls],
      amountGhs: total,
      percent: totalValueGhs > 0 ? (total / totalValueGhs) * 100 : 0,
      color: ASSET_CLASS_COLORS[cls],
      count,
    }));

  // Top single holding
  const sortedHoldings = [...holdings].sort(
    (a, b) => b.amount_ghs - a.amount_ghs
  );
  const top = sortedHoldings[0];
  const topPercent = totalValueGhs > 0 ? (top.amount_ghs / totalValueGhs) * 100 : 0;
  const topHolding: TopHoldingConcentration = {
    assetName: top.asset_name,
    amountGhs: top.amount_ghs,
    percent: topPercent,
    isConcentrated: topPercent > 25,
  };

  const score = herfindahlScore(assetClassBreakdown);
  const level = diversificationLevel(score);
  const educationalObservations = buildObservations(assetClassBreakdown, score);
  const concentrationWarnings = buildWarnings(assetClassBreakdown, topHolding);

  return {
    totalValueGhs,
    holdingsCount: holdings.length,
    assetClassBreakdown,
    topHolding,
    diversificationScore: score,
    diversificationLevel: level,
    educationalObservations,
    concentrationWarnings,
  };
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

export function validateHoldingInput(
  assetName: string,
  assetClass: string,
  amountGhs: number
): string | null {
  if (!assetName || assetName.trim().length === 0) {
    return "Asset name is required.";
  }
  if (assetName.trim().length > 100) {
    return "Asset name must be 100 characters or fewer.";
  }
  const validClasses: PortfolioAssetClass[] = [
    "gh_stock",
    "us_stock",
    "fixed_income",
    "cash_equivalent",
    "commodity",
    "real_estate",
  ];
  if (!validClasses.includes(assetClass as PortfolioAssetClass)) {
    return "Please select a valid asset class.";
  }
  if (!Number.isFinite(amountGhs) || amountGhs <= 0) {
    return "Amount must be greater than zero.";
  }
  if (amountGhs > 1_000_000_000) {
    return "Amount seems too large. Please check your entry.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// In-memory fallback store (used when Supabase is unavailable, e.g. tests)
// ---------------------------------------------------------------------------

const localStore = new Map<string, PortfolioHolding[]>();

// ---------------------------------------------------------------------------
// Supabase persistence helpers
// ---------------------------------------------------------------------------

export async function fetchPortfolioHoldings(userId: string): Promise<{
  data: PortfolioHolding[];
  error: string | null;
}> {
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      const local = localStore.get(userId) ?? [];
      return { data: local, error: error.message };
    }
    return { data: (data as PortfolioHolding[]) ?? [], error: null };
  } catch {
    const local = localStore.get(userId) ?? [];
    return { data: local, error: null };
  }
}

export async function addPortfolioHolding(
  userId: string,
  input: {
    asset_name: string;
    asset_class: PortfolioAssetClass;
    amount_ghs: number;
    notes?: string;
  }
): Promise<{ data: PortfolioHolding | null; error: string | null }> {
  const validationError = validateHoldingInput(
    input.asset_name,
    input.asset_class,
    input.amount_ghs
  );
  if (validationError) return { data: null, error: validationError };

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("portfolio_holdings")
      .insert([
        {
          user_id: userId,
          asset_name: input.asset_name.trim(),
          asset_class: input.asset_class,
          amount_ghs: input.amount_ghs,
          notes: input.notes ?? null,
        },
      ])
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as PortfolioHolding, error: null };
  } catch {
    // Local fallback
    const holding: PortfolioHolding = {
      id: `local-${Date.now()}-${Math.random()}`,
      user_id: userId,
      asset_name: input.asset_name.trim(),
      asset_class: input.asset_class,
      amount_ghs: input.amount_ghs,
      notes: input.notes ?? null,
      created_at: new Date().toISOString(),
    };
    const existing = localStore.get(userId) ?? [];
    localStore.set(userId, [holding, ...existing]);
    return { data: holding, error: null };
  }
}

export async function deletePortfolioHolding(
  userId: string,
  holdingId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { supabase } = await import("./supabase");
    const { error } = await supabase
      .from("portfolio_holdings")
      .delete()
      .eq("id", holdingId)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch {
    const existing = localStore.get(userId) ?? [];
    localStore.set(
      userId,
      existing.filter((h) => h.id !== holdingId)
    );
    return { success: true, error: null };
  }
}

