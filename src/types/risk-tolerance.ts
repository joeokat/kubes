export type RiskProfileBand = "conservative" | "moderate" | "growth";

export interface RiskQuizOption {
  id: string;
  label: string;
  description: string;
  points: number; // 1 to 4 points
}

export interface RiskQuizQuestion {
  id: string;
  questionNumber: number;
  title: string;
  prompt: string;
  contextNote: string;
  options: RiskQuizOption[];
}

export interface ConceptualAssetAllocation {
  label: string;
  percentage: number;
  description: string;
  color: string;
}

export interface RiskToleranceEvaluation {
  score: number;
  maxScore: number;
  profileBand: RiskProfileBand;
  profileLabel: string;
  summary: string;
  behavioralCharacteristics: string[];
  conceptualAllocations: ConceptualAssetAllocation[];
  learnerPrinciples: string[];
}

export interface RiskQuizResponseRecord {
  id: string;
  user_id: string;
  answers: Record<string, number>;
  score: number;
  profile_label: string;
  profile_band: RiskProfileBand;
  computed_at: string;
}

