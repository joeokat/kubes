export type AssetType = "us_stock" | "gh_stock" | "commodity";

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: AssetType;
  notes?: string | null;
  created_at: string;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  assetType: AssetType;
  currency: "GHS" | "USD";
  price: number;
  change24h: number;
  changePercent24h: number;
  market: string;
  sector: string;
  educationalNotes: string;
  riskFactors: string[];
  metrics: {
    marketCapOrSize?: string;
    range52w?: string;
    dividendYieldOrNote?: string;
    tradingHours?: string;
  };
}

