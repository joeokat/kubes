export type ScoreBand = "Building" | "Steady" | "Strong";

export type IncomeStability = "stable" | "variable" | "unpredictable";

export interface SpendBuckets {
  essentialsPercent: number;
  discretionaryPercent: number;
  debtOrOtherPercent: number;
}

export interface HealthQuizInput {
  incomeRange: string;
  incomeStability: IncomeStability;
  spendBuckets: SpendBuckets;
  savingsRate: number; // 0 - 100%
  emergencyMonths: number; // 0 - 24+ months
}

export interface DimensionScores {
  savingsScore: number; // max 35
  emergencyScore: number; // max 35
  spendScore: number; // max 20
  stabilityScore: number; // max 10
}

export interface HealthScoreResult {
  score: number; // 0 - 100
  band: ScoreBand;
  dimensionScores: DimensionScores;
  tips: string[];
  summary: string;
}

export interface HealthQuizRecord {
  id: string;
  user_id: string;
  income_range: string;
  spend_buckets: SpendBuckets;
  savings_rate: number;
  emergency_months: number;
  score: number;
  band: ScoreBand;
  computed_at: string;
}
