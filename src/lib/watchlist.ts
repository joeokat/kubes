import type { AssetType, MarketAsset, WatchlistItem } from "../types/watchlist";

export const CURATED_MARKET_ASSETS: MarketAsset[] = [
  // GSE Stocks (Ghana Stock Exchange)
  {
    symbol: "MTNGH",
    name: "Scancom PLC (MTN Ghana)",
    assetType: "gh_stock",
    currency: "GHS",
    price: 1.85,
    change24h: 0.03,
    changePercent24h: 1.65,
    market: "GSE (Accra)",
    sector: "Telecommunications & FinTech",
    educationalNotes:
      "MTN Ghana is the largest telecommunications and mobile money network operator in Ghana. Often observed by beginners due to its widespread consumer brand and consistent historical dividend distributions on the Ghana Stock Exchange.",
    riskFactors: [
      "Regulatory policy updates in the telecommunications and mobile money sector.",
      "Macroeconomic currency depreciation affecting foreign equipment procurement.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 22.7 Billion",
      range52w: "GH₵ 1.40 - GH₵ 1.95",
      dividendYieldOrNote: "Historically pays interim and final dividends",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "GCB",
    name: "GCB Bank PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 4.20,
    change24h: -0.05,
    changePercent24h: -1.18,
    market: "GSE (Accra)",
    sector: "Commercial Banking",
    educationalNotes:
      "One of Ghana's longest-standing commercial banks with a massive national retail branch footprint. Reflects trends in domestic interest rates, government treasury holdings, and corporate credit performance.",
    riskFactors: [
      "Domestic sovereign debt restructuring exposures and banking sector reserve requirements.",
      "Fluctuations in commercial loan repayment defaults during inflation spikes.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 1.11 Billion",
      range52w: "GH₵ 3.10 - GH₵ 4.60",
      dividendYieldOrNote: "Varies based on annual capital adequacy thresholds",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "TOTAL",
    name: "TotalEnergies Marketing Ghana PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 9.80,
    change24h: 0.15,
    changePercent24h: 1.55,
    market: "GSE (Accra)",
    sector: "Energy Distribution",
    educationalNotes:
      "A leading petroleum products distributor and retail service station network across Ghana. Its revenue correlates with domestic vehicular transport volumes and global refined fuel pricing dynamics.",
    riskFactors: [
      "Volatility in global crude import costs and national petroleum pricing deregulation policies.",
      "Foreign exchange volatility affecting bulk fuel importation margins.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 1.09 Billion",
      range52w: "GH₵ 6.80 - GH₵ 10.20",
      dividendYieldOrNote: "Historically regular dividend payer",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "EGH",
    name: "Ecobank Ghana PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 5.50,
    change24h: 0.0,
    changePercent24h: 0.0,
    market: "GSE (Accra)",
    sector: "Pan-African Banking",
    educationalNotes:
      "A prominent Tier-1 bank in Ghana with deep integration into cross-border trade finance and digital banking. Serves as a barometer for West African regional commerce and corporate deposits.",
    riskFactors: [
      "Cross-border currency volatility across regional trading corridors.",
      "Central Bank of Ghana monetary policy and capital preservation requirements.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 1.77 Billion",
      range52w: "GH₵ 4.80 - GH₵ 6.20",
      dividendYieldOrNote: "Board discretion subject to regulatory reserves",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },

  // US Stocks & Broad Index ETFs
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    assetType: "us_stock",
    currency: "USD",
    price: 535.4,
    change24h: 2.85,
    changePercent24h: 0.54,
    market: "NYSE Arca",
    sector: "Broad Market Index (500 Leading US Companies)",
    educationalNotes:
      "An exchange-traded fund tracking the S&P 500 index. Commonly highlighted in foundational lessons because it provides instant, low-cost diversification across 500 of America's largest publicly traded corporations.",
    riskFactors: [
      "General economic recessions in the US impacting corporate earnings broadly.",
      "For international learners: GHS/USD currency conversion rate fluctuations.",
    ],
    metrics: {
      marketCapOrSize: "Over $1 Trillion AUM",
      range52w: "$410.00 - $545.00",
      dividendYieldOrNote: "~1.3% - 1.5% distributed quarterly",
      tradingHours: "9:30 AM - 4:00 PM EST",
    },
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetType: "us_stock",
    currency: "USD",
    price: 232.5,
    change24h: -1.15,
    changePercent24h: -0.49,
    market: "NASDAQ",
    sector: "Consumer Electronics & Services",
    educationalNotes:
      "Global technology corporation manufacturing smartphones, personal computers, and subscription software services. Demonstrates the concept of corporate pricing power and global consumer brand loyalty.",
    riskFactors: [
      "Global supply chain dependencies and international trade tariffs.",
      "Consumer discretionary spending slowdowns during global inflationary periods.",
    ],
    metrics: {
      marketCapOrSize: "~$3.5 Trillion",
      range52w: "$165.00 - $237.00",
      dividendYieldOrNote: "Pays modest quarterly dividend + substantial share buybacks",
      tradingHours: "9:30 AM - 4:00 PM EST",
    },
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetType: "us_stock",
    currency: "USD",
    price: 428.15,
    change24h: 3.4,
    changePercent24h: 0.8,
    market: "NASDAQ",
    sector: "Enterprise Software & Cloud Computing",
    educationalNotes:
      "Enterprise software giant known for Windows, Office, Azure cloud infrastructure, and AI platform investments. Illustrates recurring enterprise software revenues and business-to-business resilience.",
    riskFactors: [
      "Intense competition in hyperscale cloud computing and enterprise artificial intelligence.",
      "High capital expenditures required for data center and chip infrastructure.",
    ],
    metrics: {
      marketCapOrSize: "~$3.1 Trillion",
      range52w: "$330.00 - $468.00",
      dividendYieldOrNote: "Quarterly dividend with continuous annual increases",
      tradingHours: "9:30 AM - 4:00 PM EST",
    },
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway Inc. (Class B)",
    assetType: "us_stock",
    currency: "USD",
    price: 462.8,
    change24h: 1.2,
    changePercent24h: 0.26,
    market: "NYSE",
    sector: "Multi-Sector Conglomerate & Insurance",
    educationalNotes:
      "The investment conglomerate managed historically by Warren Buffett. Holds major insurance operations, freight railroads, utility networks, and substantial equity stakes. Teaches value investing and capital allocation principles.",
    riskFactors: [
      "Insurance catastrophe underwriting losses during adverse natural disaster cycles.",
      "Conglomerate discount and succession execution over multi-decade horizons.",
    ],
    metrics: {
      marketCapOrSize: "~$990 Billion",
      range52w: "$340.00 - $475.00",
      dividendYieldOrNote: "Pays no cash dividend; reinvests 100% of retained earnings",
      tradingHours: "9:30 AM - 4:00 PM EST",
    },
  },

  // Commodities
  {
    symbol: "CC",
    name: "Cocoa",
    assetType: "commodity",
    currency: "USD",
    price: 7450.0,
    change24h: 85.0,
    changePercent24h: 1.15,
    market: "ICE Futures US / Global Commodities",
    sector: "Agricultural Soft Commodity",
    educationalNotes:
      "A cornerstone commodity for Ghana's national economy. Ghana and Côte d'Ivoire supply the majority of the world's cocoa. Teaches learners how weather conditions, crop diseases (e.g. swollen shoot virus), and COCOBOD producer prices impact global food pricing and national foreign exchange reserves.",
    riskFactors: [
      "Weather volatility (El Niño / rainfall patterns) affecting agricultural yield.",
      "Smuggling pressures and government-set farmgate producer floor pricing adjustments.",
    ],
    metrics: {
      marketCapOrSize: "Traded per Metric Ton (MT)",
      range52w: "$3,400 - $11,700 / MT",
      dividendYieldOrNote: "Physical raw commodity; generates no dividend yield",
      tradingHours: "Commodity Futures Market Hours",
    },
  },
  {
    symbol: "XAU",
    name: "Gold",
    assetType: "commodity",
    currency: "USD",
    price: 2735.6,
    change24h: 14.2,
    changePercent24h: 0.52,
    market: "London Bullion / COMEX",
    sector: "Precious Metals",
    educationalNotes:
      "Historically utilized as a store of value and hedge against fiat currency inflation. Ghana is Africa's leading gold producer. Studying gold helps beginners understand the relationship between real interest rates, central bank reserves, and safe-haven demand.",
    riskFactors: [
      "Opportunity cost: Gold produces no income or cash flows, unlike dividend stocks or treasury bills.",
      "Stronger US Dollar and elevated real bond yields historically apply downward pressure on bullion.",
    ],
    metrics: {
      marketCapOrSize: "Quoted per Troy Ounce",
      range52w: "$1,970 - $2,750 / oz",
      dividendYieldOrNote: "Zero yield; returns depend entirely on capital appreciation",
      tradingHours: "24 Hours Global Over-The-Counter",
    },
  },
  {
    symbol: "CL",
    name: "Crude Oil (Brent / WTI)",
    assetType: "commodity",
    currency: "USD",
    price: 75.8,
    change24h: -0.65,
    changePercent24h: -0.85,
    market: "NYMEX / ICE Europe",
    sector: "Energy Commodity",
    educationalNotes:
      "The lifeblood of global transportation and manufacturing. Ghana produces crude oil from offshore fields (Jubilee, TEN, Sankofa). Oil price changes directly influence local fuel pump prices and government petroleum revenue receipts.",
    riskFactors: [
      "OPEC+ production quotas and geopolitical conflicts in producer regions.",
      "Global energy transition trends and electric vehicle adoption long-term.",
    ],
    metrics: {
      marketCapOrSize: "Quoted per Barrel (bbl)",
      range52w: "$68.00 - $94.00 / bbl",
      dividendYieldOrNote: "Zero direct yield; subject to storage and rollover costs in futures",
      tradingHours: "Sunday 6 PM - Friday 5 PM EST",
    },
  },
];

/**
 * Returns available assets, optionally filtered by asset type.
 */
export function getAvailableAssets(filter?: AssetType | "all"): MarketAsset[] {
  if (!filter || filter === "all") {
    return CURATED_MARKET_ASSETS;
  }
  return CURATED_MARKET_ASSETS.filter((asset) => asset.assetType === filter);
}

/**
 * Finds an asset by its ticker symbol.
 */
export function getAssetBySymbol(symbol: string): MarketAsset | null {
  const normalized = symbol.trim().toUpperCase();
  return (
    CURATED_MARKET_ASSETS.find((asset) => asset.symbol.toUpperCase() === normalized) ||
    null
  );
}

/**
 * Searches assets by symbol or name.
 */
export function searchAssets(query: string, filter?: AssetType | "all"): MarketAsset[] {
  const sanitized = query.trim().toLowerCase();
  const pool = getAvailableAssets(filter);
  if (!sanitized) return pool;

  return pool.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(sanitized) ||
      asset.name.toLowerCase().includes(sanitized) ||
      asset.sector.toLowerCase().includes(sanitized),
  );
}

/**
 * Formats asset price with its currency symbol.
 */
export function formatAssetPrice(price: number, currency: "GHS" | "USD"): string {
  const prefix = currency === "GHS" ? "GH₵" : "$";
  return `${prefix}${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats 24h change with explicit +/- sign.
 */
export function formatAssetChange(change: number, percent: number): {
  text: string;
  isPositive: boolean;
  isNeutral: boolean;
} {
  const isNeutral = Math.abs(percent) < 0.001;
  const isPositive = percent > 0;
  const sign = isPositive ? "+" : "";
  return {
    text: `${sign}${percent.toFixed(2)}% (${sign}${change.toFixed(2)})`,
    isPositive,
    isNeutral,
  };
}

/**
 * Checks if a symbol is in the user's watchlist items list.
 */
export function isSymbolInWatchlist(
  watchlist: WatchlistItem[],
  symbol: string,
): boolean {
  const normalized = symbol.trim().toUpperCase();
  return watchlist.some((item) => item.symbol.toUpperCase() === normalized);
}

// In-memory fallback store for offline/development mode
const LOCAL_WATCHLIST_STORE = new Map<string, WatchlistItem[]>();

/**
 * Fetches user's saved watchlist items from Supabase (with fallback).
 */
export async function fetchUserWatchlist(
  userId: string,
): Promise<{ data: WatchlistItem[]; error: Error | null }> {
  if (!userId) {
    return { data: [], error: null };
  }

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("watchlist_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // Use local memory fallback if table does not exist or user is offline
      const fallback = LOCAL_WATCHLIST_STORE.get(userId) || [];
      return { data: fallback, error: null };
    }

    const items = (data || []) as WatchlistItem[];
    LOCAL_WATCHLIST_STORE.set(userId, items);
    return { data: items, error: null };
  } catch (err) {
    const fallback = LOCAL_WATCHLIST_STORE.get(userId) || [];
    return { data: fallback, error: null };
  }
}

/**
 * Adds an asset to the user's watchlist in Supabase.
 */
export async function addToWatchlist(
  userId: string,
  symbol: string,
  assetType: AssetType,
): Promise<{ data: WatchlistItem | null; error: Error | null }> {
  if (!userId || !symbol) {
    return { data: null, error: new Error("User ID and symbol are required.") };
  }

  const normalizedSymbol = symbol.trim().toUpperCase();

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("watchlist_items")
      .insert({
        user_id: userId,
        symbol: normalizedSymbol,
        asset_type: assetType,
      })
      .select()
      .single();

    if (error) {
      // Create local fallback entry
      const existing = LOCAL_WATCHLIST_STORE.get(userId) || [];
      if (!existing.some((item) => item.symbol === normalizedSymbol)) {
        const fallbackItem: WatchlistItem = {
          id: `local-${Date.now()}`,
          user_id: userId,
          symbol: normalizedSymbol,
          asset_type: assetType,
          created_at: new Date().toISOString(),
        };
        LOCAL_WATCHLIST_STORE.set(userId, [fallbackItem, ...existing]);
        return { data: fallbackItem, error: null };
      }
      return { data: null, error: new Error(error.message) };
    }

    const item = data as WatchlistItem;
    const existing = LOCAL_WATCHLIST_STORE.get(userId) || [];
    LOCAL_WATCHLIST_STORE.set(userId, [
      item,
      ...existing.filter((i) => i.symbol !== normalizedSymbol),
    ]);
    return { data: item, error: null };
  } catch (err) {
    // Fallback store
    const existing = LOCAL_WATCHLIST_STORE.get(userId) || [];
    const fallbackItem: WatchlistItem = {
      id: `local-${Date.now()}`,
      user_id: userId,
      symbol: normalizedSymbol,
      asset_type: assetType,
      created_at: new Date().toISOString(),
    };
    LOCAL_WATCHLIST_STORE.set(userId, [fallbackItem, ...existing]);
    return { data: fallbackItem, error: null };
  }
}

/**
 * Removes an asset from the user's watchlist in Supabase.
 */
export async function removeFromWatchlist(
  userId: string,
  symbol: string,
): Promise<{ success: boolean; error: Error | null }> {
  if (!userId || !symbol) {
    return { success: false, error: new Error("User ID and symbol are required.") };
  }

  const normalizedSymbol = symbol.trim().toUpperCase();

  try {
    const { supabase } = await import("./supabase");
    const { error } = await supabase
      .from("watchlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("symbol", normalizedSymbol);

    const existing = LOCAL_WATCHLIST_STORE.get(userId) || [];
    LOCAL_WATCHLIST_STORE.set(
      userId,
      existing.filter((i) => i.symbol !== normalizedSymbol),
    );

    if (error) {
      // Local removal already executed above
      return { success: true, error: null };
    }

    return { success: true, error: null };
  } catch (err) {
    const existing = LOCAL_WATCHLIST_STORE.get(userId) || [];
    LOCAL_WATCHLIST_STORE.set(
      userId,
      existing.filter((i) => i.symbol !== normalizedSymbol),
    );
    return { success: true, error: null };
  }
}

