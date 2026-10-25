export type MarketNewsCategory =
  | "gse_ghana"
  | "macro_africa"
  | "us_global"
  | "commodities";

export interface MarketIntelligenceItem {
  id: string;
  title: string;
  summary: string;
  educational_takeaway: string;
  category: MarketNewsCategory;
  source_name: string;
  source_url?: string;
  impact_tag: string;
  published_at: string;
  is_approved: boolean;
}

