export type PortfolioAssetClass =
  | "gh_stock"
  | "us_stock"
  | "fixed_income"
  | "cash_equivalent"
  | "commodity"
  | "real_estate";

export interface PortfolioHolding {
  id: string;
  user_id: string;
  asset_name: string;
  asset_class: PortfolioAssetClass;
  amount_ghs: number;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AssetClassAllocation {
  assetClass: PortfolioAssetClass;
  label: string;
  amountGhs: number;
  percent: number;
  color: string;
  count: number;
}

export interface TopHoldingConcentration {
  assetName: string;
  amountGhs: number;
  percent: number;
  isConcentrated: boolean; // true if > 25% of total portfolio
}

export type DiversificationLevel =
  | "High Concentration"
  | "Moderate Spread"
  | "Well Diversified";

export interface DiversificationMetrics {
  totalValueGhs: number;
  holdingsCount: number;
  assetClassBreakdown: AssetClassAllocation[];
  topHolding: TopHoldingConcentration | null;
  diversificationScore: number; // 0 to 100
  diversificationLevel: DiversificationLevel;
  educationalObservations: string[];
  concentrationWarnings: string[];
}

