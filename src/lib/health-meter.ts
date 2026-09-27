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

export const INCOME_RANGE_OPTIONS = [
  { id: "tier_1", label: "Entry / Starting Out", subtitle: "Building baseline cash flow" },
  { id: "tier_2", label: "Growing / Moderate", subtitle: "Consistent monthly earnings" },
  { id: "tier_3", label: "Established", subtitle: "Comfortable buffer above necessities" },
  { id: "tier_4", label: "High Earner", subtitle: "Substantial disposable margin" },
];

export const INCOME_STABILITY_OPTIONS: { id: IncomeStability; label: string; desc: string }[] = [
  { id: "stable", label: "Predictable / Salaried", desc: "Reliable payout every month" },
  { id: "variable", label: "Variable / Commission", desc: "Fluctuates by season or projects" },
  { id: "unpredictable", label: "Irregular / Freelance", desc: "Irregular timing and amounts" },
];

/**
 * Calculates the score component for savings rate (0 to 35 points).
 */
export function calculateSavingsScore(savingsRate: number): number {
  if (savingsRate >= 20) return 35;
  if (savingsRate >= 15) return 28;
  if (savingsRate >= 10) return 20;
  if (savingsRate >= 5) return 12;
  if (savingsRate > 0) return 5;
  return 0;
}

/**
 * Calculates the score component for emergency fund runway (0 to 35 points).
 */
export function calculateEmergencyScore(emergencyMonths: number): number {
  if (emergencyMonths >= 6) return 35;
  if (emergencyMonths >= 4.5) return 30;
  if (emergencyMonths >= 3) return 25;
  if (emergencyMonths >= 1.5) return 18;
  if (emergencyMonths >= 1) return 12;
  if (emergencyMonths > 0) return 5;
  return 0;
}

/**
 * Calculates the score component for essential spending ratio (0 to 20 points).
 * Aligns with the 55% essentials guideline.
 */
export function calculateSpendScore(spendBuckets: SpendBuckets): number {
  const essentials = spendBuckets.essentialsPercent;
  if (essentials <= 50) return 20;
  if (essentials <= 60) return 17;
  if (essentials <= 70) return 12;
  if (essentials <= 80) return 8;
  if (essentials <= 90) return 4;
  return 2;
}

/**
 * Calculates the score component for income stability (0 to 10 points).
 */
export function calculateStabilityScore(stability: IncomeStability): number {
  switch (stability) {
    case "stable":
      return 10;
    case "variable":
      return 6;
    case "unpredictable":
      return 3;
    default:
      return 5;
  }
}

/**
 * Categorizes an overall score (0 - 100) into a qualitative band.
 */
export function determineScoreBand(score: number): ScoreBand {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Steady";
  return "Building";
}

/**
 * Generates generic educational tips based on individual assessment dimensions.
 * Strictly non-advisory per SOP §7.
 */
export function generateHealthTips(input: HealthQuizInput, _dimensions: DimensionScores): string[] {
  const tips: string[] = [];

  // Emergency runway tip
  if (input.emergencyMonths < 3) {
    tips.push(
      "Emergency Runway: Establishing a 3 to 6 month liquid cushion protects your goals and prevents liquidating long-term investments during unexpected shocks."
    );
  } else if (input.emergencyMonths >= 6) {
    tips.push(
      "Emergency Runway: You have a solid 6+ month emergency cushion. Maintaining this in accessible, low-risk vehicles provides peace of mind."
    );
  } else {
    tips.push(
      "Emergency Runway: A 3-month buffer is a strong baseline. Aim to gradually step it up toward 6 months as income allows."
    );
  }

  // Savings rate tip
  if (input.savingsRate < 10) {
    tips.push(
      "Savings Habit: Even modest monthly contributions (e.g. 5–10%) create an enduring habit that accelerates as your earnings expand."
    );
  } else if (input.savingsRate >= 20) {
    tips.push(
      "Savings Habit: Exceptional savings discipline. Allocating 20% or more each month maximizes compounding over a multi-year horizon."
    );
  } else {
    tips.push(
      "Savings Habit: Saving 10–20% places you on steady ground. Consider automating transfers on payday to keep the habit effortless."
    );
  }

  // Essentials spending tip
  if (input.spendBuckets.essentialsPercent > 70) {
    tips.push(
      "Fixed Essentials: Essentials consume over 70% of income. Reviewing recurring fixed commitments can help unlock flexibility for saving."
    );
  } else if (input.spendBuckets.essentialsPercent <= 55) {
    tips.push(
      "Cash Flow Balance: Your essential expenses align well with balanced budgeting frameworks (like the 55/5/10/15/15 model)."
    );
  }

  return tips;
}

/**
 * Pure calculation function for evaluating financial health assessment inputs.
 */
export function calculateHealthScore(input: HealthQuizInput): HealthScoreResult {
  const savingsScore = calculateSavingsScore(input.savingsRate);
  const emergencyScore = calculateEmergencyScore(input.emergencyMonths);
  const spendScore = calculateSpendScore(input.spendBuckets);
  const stabilityScore = calculateStabilityScore(input.incomeStability);

  const rawScore = savingsScore + emergencyScore + spendScore + stabilityScore;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const band = determineScoreBand(clampedScore);
  const dimensionScores: DimensionScores = {
    savingsScore,
    emergencyScore,
    spendScore,
    stabilityScore,
  };

  const tips = generateHealthTips(input, dimensionScores);

  let summary = "";
  if (band === "Strong") {
    summary =
      "Your financial foundation is robust with a resilient emergency runway and disciplined savings habits. You are well positioned to focus on long-term compound growth.";
  } else if (band === "Steady") {
    summary =
      "You have good baseline financial habits in place. Continuing to reinforce your emergency cushion and optimizing discretionary spending will move you into a strong position.";
  } else {
    summary =
      "You are in the building phase. Prioritize creating a starter emergency fund and tracking where monthly cash flows go before expanding into longer-term commitments.";
  }

  return {
    score: clampedScore,
    band,
    dimensionScores,
    tips,
    summary,
  };
}

/**
 * Storage key helper for offline/instant cache
 */
function getStorageKey(userId: string): string {
  return `@kubes_health_meter_${userId}`;
}

/**
 * Saves a health quiz response to Supabase and caches locally.
 */
export async function saveHealthQuizResponse(
  userId: string,
  input: HealthQuizInput,
  result: HealthScoreResult
): Promise<{ data: HealthQuizRecord | null; error: Error | null }> {
  const record: Omit<HealthQuizRecord, "id"> = {
    user_id: userId,
    income_range: input.incomeRange,
    spend_buckets: input.spendBuckets,
    savings_rate: input.savingsRate,
    emergency_months: input.emergencyMonths,
    score: result.score,
    band: result.band,
    computed_at: new Date().toISOString(),
  };

  // Cache locally first for instant offline access
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(record));
  } catch (_e) {
    // Non-blocking in node test or SSR environments
  }

  // Persist to Supabase
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("health_quiz_responses")
      .insert({
        user_id: userId,
        income_range: input.incomeRange,
        spend_buckets: input.spendBuckets,
        savings_rate: input.savingsRate,
        emergency_months: input.emergencyMonths,
        score: result.score,
        band: result.band,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as HealthQuizRecord, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetches the most recent health quiz response for a user.
 */
export async function fetchLatestHealthScore(
  userId: string
): Promise<HealthQuizRecord | null> {
  // Check local storage first
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const cached = await AsyncStorage.getItem(getStorageKey(userId));
    if (cached) {
      const parsed = JSON.parse(cached);
      // Return cached while fetching fresh data asynchronously
      fetchFreshHealthScore(userId).catch(() => {});
      return parsed;
    }
  } catch (_e) {
    // Fall through to remote
  }

  return fetchFreshHealthScore(userId);
}

async function fetchFreshHealthScore(userId: string): Promise<HealthQuizRecord | null> {
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("health_quiz_responses")
      .select("*")
      .eq("user_id", userId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const record = data as HealthQuizRecord;
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(record));
    } catch (_e) {}

    return record;
  } catch (_e) {
    return null;
  }
}
