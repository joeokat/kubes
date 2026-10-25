import type {
  MarketNewsCategory,
  MarketIntelligenceItem,
} from "../types/market-intelligence";

export const CURATED_MARKET_INTELLIGENCE: MarketIntelligenceItem[] = [
  {
    id: "mi-1",
    title: "Bank of Ghana Holds Monetary Policy Rate: Implications for T-Bills and Equities",
    summary:
      "The Bank of Ghana's Monetary Policy Committee announced its decision to maintain the policy rate, citing disinflation momentum and foreign exchange reserve rebuilding.",
    educational_takeaway:
      "When central banks hold interest rates steady after a hiking cycle, 91-day Treasury Bill yields tend to stabilize. For beginner investors, this highlights the trade-off: fixed-income instruments offer steady short-term yield, while equities (stocks) provide long-term inflation defense through business earnings growth.",
    category: "macro_africa",
    source_name: "Bank of Ghana (MPC Statement)",
    impact_tag: "Interest Rates & T-Bills",
    published_at: "2026-10-24T09:30:00Z",
    is_approved: true,
  },
  {
    id: "mi-2",
    title: "MTN Ghana Reports Sustained Mobile Money and Data Revenue Growth on GSE",
    summary:
      "Scancom PLC (MTN Ghana) published third-quarter trading figures showing robust year-on-year expansion in active MoMo users and mobile data demand across all 16 regions.",
    educational_takeaway:
      "Public companies on the Ghana Stock Exchange are legally required to disclose audited periodic earnings. Observing how consumer mobile habits translate into corporate cash flow helps learners understand how revenue generates dividend distributions.",
    category: "gse_ghana",
    source_name: "Ghana Stock Exchange News Service",
    impact_tag: "GSE Equities",
    published_at: "2026-10-23T14:15:00Z",
    is_approved: true,
  },
  {
    id: "mi-3",
    title: "Global Cocoa Prices Stabilize Following West African Weather Adjustments",
    summary:
      "ICE cocoa futures experienced a price correction after improved seasonal rainfall reports across key growing belts in Ghana and Western Côte d'Ivoire.",
    educational_takeaway:
      "Cocoa is a soft agricultural commodity. Supply disruptions from weather or pest infestations cause price spikes, whereas favorable weather expands projected harvest tonnage. Cocoa pricing directly influences Ghana's foreign exchange inflows and national balance of payments.",
    category: "commodities",
    source_name: "International Cocoa Organization",
    impact_tag: "Commodity Volatility",
    published_at: "2026-10-22T11:00:00Z",
    is_approved: true,
  },
  {
    id: "mi-4",
    title: "US Federal Reserve Rate Cut Expectations and Emerging Market Currency Trends",
    summary:
      "Federal Reserve commentary signaled a gradual approach to easing US interest rates, keeping the US Dollar index elevated against broader global currencies.",
    educational_takeaway:
      "Global markets are interconnected. When US interest rates stay high relative to emerging markets, global capital flows toward USD assets. For Ghanaian learners studying US stocks or ETFs, understanding the GHS/USD exchange rate is essential because your returns depend both on asset price and currency movement.",
    category: "us_global",
    source_name: "Federal Reserve Economic Data",
    impact_tag: "Global Macro & FX",
    published_at: "2026-10-21T16:45:00Z",
    is_approved: true,
  },
  {
    id: "mi-5",
    title: "Ghana Statistical Service Reports Consumer Price Index (CPI) Inflation Moderation",
    summary:
      "Headline year-on-year inflation slowed, primarily driven by seasonal food harvest supplies and stabilization in commercial transport fares.",
    educational_takeaway:
      "Inflation measures how quickly your purchasing power deteriorates. If inflation is 20% and your savings account yields 8%, your real return is negative (-12%). This foundational reality is why building sound investing habits in productive assets matters.",
    category: "macro_africa",
    source_name: "Ghana Statistical Service (GSS)",
    impact_tag: "Inflation & Purchasing Power",
    published_at: "2026-10-20T10:00:00Z",
    is_approved: true,
  },
  {
    id: "mi-6",
    title: "Gold Consolidates Near Historical Highs on Global Central Bank Diversification",
    summary:
      "Spot gold traded near record territory as central banks across Africa and Asia continued expanding gold bullion holdings as an alternative reserve asset.",
    educational_takeaway:
      "Central banks accumulate gold because it has no sovereign default risk and cannot be printed by any single government. Unlike commercial shares, physical gold yields no quarterly dividend, meaning its total return is purely driven by market valuation shifts.",
    category: "commodities",
    source_name: "World Gold Council",
    impact_tag: "Precious Metals",
    published_at: "2026-10-19T08:20:00Z",
    is_approved: true,
  },
  {
    id: "mi-7",
    title: "Ghana Stock Exchange Deepens Capital Market Financial Literacy Collaborations",
    summary:
      "The GSE management reiterated initiatives to introduce retail youth investors to licensed brokers, depository accounts (CSD), and secondary trading regulations.",
    educational_takeaway:
      "To participate in the real Ghana Stock Exchange, investors must open a Central Securities Depository (CSD) account through a broker licensed by SEC Ghana. Kubes remains an educational sandbox to prepare your mind before taking that formal step.",
    category: "gse_ghana",
    source_name: "GSE Regulatory Bulletin",
    impact_tag: "Market Infrastructure",
    published_at: "2026-10-18T13:40:00Z",
    is_approved: true,
  },
];

/**
 * Filter items by category.
 */
export function filterMarketIntelligenceByCategory(
  items: MarketIntelligenceItem[],
  category: MarketNewsCategory | "all",
): MarketIntelligenceItem[] {
  if (category === "all") return items;
  return items.filter((item) => item.category === category);
}

/**
 * Search items across headline, summary, source, or impact tag.
 */
export function searchMarketIntelligence(
  items: MarketIntelligenceItem[],
  query: string,
): MarketIntelligenceItem[] {
  const sanitized = query.trim().toLowerCase();
  if (!sanitized) return items;

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(sanitized) ||
      item.summary.toLowerCase().includes(sanitized) ||
      item.source_name.toLowerCase().includes(sanitized) ||
      item.impact_tag.toLowerCase().includes(sanitized),
  );
}

/**
 * Formats ISO date into human-readable relative or calendar format.
 */
export function formatPublishedDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (err) {
    return "Recent";
  }
}

/**
 * Fetches approved market intelligence items from Supabase with fallback.
 */
export async function fetchMarketIntelligence(
  category: MarketNewsCategory | "all" = "all",
): Promise<{ data: MarketIntelligenceItem[]; error: Error | null }> {
  try {
    const { supabase } = await import("./supabase");
    let query = supabase
      .from("market_intelligence")
      .select("*")
      .eq("is_approved", true)
      .order("published_at", { ascending: false });

    if (category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Graceful fallback to curated data
      const filtered = filterMarketIntelligenceByCategory(
        CURATED_MARKET_INTELLIGENCE,
        category,
      );
      return { data: filtered, error: null };
    }

    return { data: data as MarketIntelligenceItem[], error: null };
  } catch (err) {
    const filtered = filterMarketIntelligenceByCategory(
      CURATED_MARKET_INTELLIGENCE,
      category,
    );
    return { data: filtered, error: null };
  }
}

