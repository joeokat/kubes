import type {
  RiskProfileBand,
  RiskQuizQuestion,
  RiskToleranceEvaluation,
  RiskQuizResponseRecord,
} from "../types/risk-tolerance";

export const RISK_QUIZ_QUESTIONS: RiskQuizQuestion[] = [
  {
    id: "horizon",
    questionNumber: 1,
    title: "Investment Time Horizon",
    prompt:
      "When do you anticipate needing to withdraw the majority of the money you plan to invest?",
    contextNote:
      "Money needed soon should not be exposed to short-term market swings. Longer horizons allow investments to weather cycles.",
    options: [
      {
        id: "h1",
        label: "Within the next 12 months (Very Short Term)",
        description: "Need funds accessible for imminent planned expenses or emergency backup.",
        points: 1,
      },
      {
        id: "h2",
        label: "Between 1 to 3 years (Short Term)",
        description: "Targeting a medium-term goal like school fees, wedding, or relocation.",
        points: 2,
      },
      {
        id: "h3",
        label: "Between 3 to 7 years (Medium Term)",
        description: "Building wealth with enough time to ride out normal economic slowdowns.",
        points: 3,
      },
      {
        id: "h4",
        label: "More than 7 years (Long Horizon)",
        description: "Long-term compounding for retirement, land acquisition, or generational wealth.",
        points: 4,
      },
    ],
  },
  {
    id: "reaction_to_drop",
    questionNumber: 2,
    title: "Emotional Reaction to Volatility",
    prompt:
      "Suppose the general market drops by 20% over 3 months, reducing your investment value. How would you react?",
    contextNote:
      "Market corrections are natural parts of economic cycles. Your emotional reaction dictates your true risk tolerance.",
    options: [
      {
        id: "r1",
        label: "Sell everything immediately to stop further losses",
        description: "Cannot tolerate seeing my principal balance decline under any circumstances.",
        points: 1,
      },
      {
        id: "r2",
        label: "Feel anxious and sell some portion to feel secure",
        description: "I prefer to move money into cash or fixed deposit to regain peace of mind.",
        points: 2,
      },
      {
        id: "r3",
        label: "Hold patiently and wait for the market cycle to recover",
        description: "I understand prices bounce back over multi-year cycles and I can stay patient.",
        points: 3,
      },
      {
        id: "r4",
        label: "Stay calm and continue steady regular contributions",
        description: "I view lower prices as an opportunity to accumulate shares at lower valuations.",
        points: 4,
      },
    ],
  },
  {
    id: "primary_goal",
    questionNumber: 3,
    title: "Capital Goal & Trade-Off",
    prompt:
      "Which trade-off best matches how you want your surplus savings to work?",
    contextNote:
      "Higher potential returns inevitably require accepting higher volatility. Safety yields modest returns.",
    options: [
      {
        id: "g1",
        label: "Maximum Safety: Preserve every cedi, even if inflation outpaces it",
        description: "Zero appetite for loss of nominal principal. Certainty is paramount.",
        points: 1,
      },
      {
        id: "g2",
        label: "Conservative Stability: Low risk with modest interest",
        description: "Willing to accept minor fluctuations if it yields slightly above basic savings.",
        points: 2,
      },
      {
        id: "g3",
        label: "Balanced Growth: Keep pace with inflation while growing steadily",
        description: "Comfortable with moderate ups and downs to preserve long-term purchasing power.",
        points: 3,
      },
      {
        id: "g4",
        label: "Aggressive Compounding: Maximize wealth over long horizons",
        description: "Willing to endure substantial drawdowns in exchange for higher long-term compounding.",
        points: 4,
      },
    ],
  },
  {
    id: "experience",
    questionNumber: 4,
    title: "Familiarity with Financial Markets",
    prompt:
      "How familiar are you with observing financial asset prices move up and down over time?",
    contextNote:
      "Experience with past drawdowns helps investors avoid emotional decision-making during volatility.",
    options: [
      {
        id: "e1",
        label: "Complete beginner — I have never owned an investment",
        description: "Fluctuating balances are completely foreign and intimidating to me.",
        points: 1,
      },
      {
        id: "e2",
        label: "Basic awareness — I know about Treasury bills and bank deposits",
        description: "I have used guaranteed return instruments but haven't held variable equities.",
        points: 2,
      },
      {
        id: "e3",
        label: "Moderately comfortable — I understand stocks and mutual funds rise and fall",
        description: "I follow financial news and understand paper losses are not permanent losses until sold.",
        points: 3,
      },
      {
        id: "e4",
        label: "Experienced — I have experienced full market cycles before",
        description: "I am familiar with bull and bear cycles and focus on business fundamentals.",
        points: 4,
      },
    ],
  },
  {
    id: "emergency_buffer",
    questionNumber: 5,
    title: "Emergency Reserves & Cash Cushion",
    prompt:
      "How secure is your emergency cash fund outside of any money you plan to invest?",
    contextNote:
      "Investing without an emergency fund often forces beginners to sell long-term assets at the worst possible time.",
    options: [
      {
        id: "b1",
        label: "No emergency cushion yet",
        description: "An unexpected car repair, medical bill, or job interruption would force me to sell investments immediately.",
        points: 1,
      },
      {
        id: "b2",
        label: "Modest cushion (1 to 2 months of basic living expenses)",
        description: "Some safety net in mobile money or savings, but still vulnerable to large shocks.",
        points: 2,
      },
      {
        id: "b3",
        label: "Solid safety net (3 to 6 months in cash or 91-day T-Bills)",
        description: "Comfortable emergency buffer completely isolated from investment accounts.",
        points: 3,
      },
      {
        id: "b4",
        label: "Substantial cushion (6+ months) plus steady predictable income",
        description: "Extremely secure cash moat with zero risk of needing to liquidate investments prematurely.",
        points: 4,
      },
    ],
  },
];

/**
 * Evaluates the 5 quiz answers into a standardized risk tolerance profile.
 * Total score: 5 to 20 points.
 * - 5 to 8: Conservative (Capital Preservation Focus)
 * - 9 to 14: Moderate (Balanced Growth & Defense)
 * - 15 to 20: Growth (Long-Horizon Compounding Focus)
 */
export function evaluateRiskToleranceScore(
  answers: Record<string, number>,
): RiskToleranceEvaluation {
  const questionIds = RISK_QUIZ_QUESTIONS.map((q) => q.id);
  let totalScore = 0;

  for (const qId of questionIds) {
    const scoreVal = answers[qId];
    if (typeof scoreVal === "number" && scoreVal >= 1 && scoreVal <= 4) {
      totalScore += scoreVal;
    } else {
      // Default fallback score for missing answers is conservative baseline (1)
      totalScore += 1;
    }
  }

  // Constrain to valid range
  totalScore = Math.max(5, Math.min(20, totalScore));

  let profileBand: RiskProfileBand = "moderate";
  let profileLabel = "Moderate (Balanced Growth & Defense)";
  let summary = "";
  let behavioralCharacteristics: string[] = [];
  let conceptualAllocations = [];
  let learnerPrinciples: string[] = [];

  if (totalScore <= 8) {
    profileBand = "conservative";
    profileLabel = "Conservative (Capital Preservation Focus)";
    summary =
      "Your self-reported answers indicate a strong preference for financial stability and principal protection. You are uncomfortable with sharp market declines and prefer predictable, low-volatility vehicles.";
    behavioralCharacteristics = [
      "Prioritizes sleeping well at night over pursuing high potential investment gains.",
      "Vulnerable to panic-selling if portfolio balances drop significantly in the short term.",
      "Best aligned with short-to-medium time horizons where preserving nominal capital is essential.",
    ];
    conceptualAllocations = [
      {
        label: "Fixed Income & Cash Equivalents",
        percentage: 75,
        description: "Government Treasury Bills, high-yield cash deposits, and money market funds.",
        color: "#059669",
      },
      {
        label: "Broad Market Equities",
        percentage: 20,
        description: "High-dividend blue-chip domestic stocks or broad index funds for modest inflation defense.",
        color: "#2563EB",
      },
      {
        label: "Defensive Real Assets",
        percentage: 5,
        description: "Modest allocation to gold or inflation-hedging commodities.",
        color: "#D97706",
      },
    ];
    learnerPrinciples = [
      "Focus first on fully establishing a 3-6 month emergency fund before allocating to equities.",
      "Understand that being 100% in cash carries inflation risk (loss of future purchasing power).",
      "Do not invest money needed within 24 months into variable stock markets.",
    ];
  } else if (totalScore <= 14) {
    profileBand = "moderate";
    profileLabel = "Moderate (Balanced Growth & Defense)";
    summary =
      "You demonstrate a balanced attitude toward risk and reward. You recognize that moderate market fluctuations are a necessary trade-off to outpace inflation, but you still value a defensive anchor to cushion drawdowns.";
    behavioralCharacteristics = [
      "Willing to accept paper fluctuations over multi-year cycles without hasty emotional reactions.",
      "Prefers a blend of growth-seeking assets and stable income-generating assets.",
      "Typically has a 3 to 7 year horizon with a basic emergency safety cushion in place.",
    ];
    conceptualAllocations = [
      {
        label: "Broad Equities & Index Funds",
        percentage: 50,
        description: "GSE index leaders and global ETFs (e.g. S&P 500) for compound economic growth.",
        color: "#2563EB",
      },
      {
        label: "Fixed Income & T-Bills",
        percentage: 40,
        description: "Sovereign treasury securities and corporate notes to stabilize portfolio valuation.",
        color: "#059669",
      },
      {
        label: "Real Assets & Commodities",
        percentage: 10,
        description: "Gold and commodity exposure to diversify against currency volatility.",
        color: "#D97706",
      },
    ];
    learnerPrinciples = [
      "Rebalance periodically: when equities run high, reallocating gains to fixed income maintains your desired risk profile.",
      "Dollar-cost averaging (investing a fixed amount monthly) helps remove market-timing anxiety.",
      "Ensure your emergency buffer is maintained separately in pure cash.",
    ];
  } else {
    profileBand = "growth";
    profileLabel = "Growth (Long-Horizon Compounding Focus)";
    summary =
      "Your profile reflects a long investment horizon, solid financial buffers, and high emotional resilience during market corrections. You understand that business ownership and equities are the historical engines of real wealth creation.";
    behavioralCharacteristics = [
      "Comfortable with temporary 20%+ drawdowns, viewing them as routine market corrections rather than permanent losses.",
      "Has a 7+ year horizon that allows volatile asset classes sufficient time to compound.",
      "Maintains strong independent cash reserves so investments never need to be liquidated under distress.",
    ];
    conceptualAllocations = [
      {
        label: "Broad Equities (Domestic & Global)",
        percentage: 75,
        description: "GSE growth equities, US index funds (S&P 500 / VOO), and productive enterprises.",
        color: "#2563EB",
      },
      {
        label: "Fixed Income & Cash Reserves",
        percentage: 15,
        description: "Liquidity buffer to capture market opportunities during deep pullbacks.",
        color: "#059669",
      },
      {
        label: "Commodities & Real Assets",
        percentage: 10,
        description: "Gold and physical asset proxies to guard against extreme macroeconomic shifts.",
        color: "#D97706",
      },
    ];
    learnerPrinciples = [
      "Patience is your greatest advantage: the longer you leave compounding uninterrupted, the more volatility smooths out.",
      "Avoid the temptation to trade frequently or chase speculative hot tips.",
      "Remember that aggressive allocation requires absolute discipline during broad economic recessions.",
    ];
  }

  return {
    score: totalScore,
    maxScore: 20,
    profileBand,
    profileLabel,
    summary,
    behavioralCharacteristics,
    conceptualAllocations,
    learnerPrinciples,
  };
}

// In-memory fallback cache for development or offline testing
const LOCAL_RISK_RESPONSES = new Map<string, RiskQuizResponseRecord>();

/**
 * Fetches the user's latest risk tolerance assessment from Supabase (with fallback).
 */
export async function fetchLatestRiskTolerance(
  userId: string,
): Promise<{ data: RiskQuizResponseRecord | null; error: Error | null }> {
  if (!userId) return { data: null, error: null };

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("risk_tolerance_responses")
      .select("*")
      .eq("user_id", userId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      const fallback = LOCAL_RISK_RESPONSES.get(userId) || null;
      return { data: fallback, error: null };
    }

    if (data) {
      const record = data as RiskQuizResponseRecord;
      LOCAL_RISK_RESPONSES.set(userId, record);
      return { data: record, error: null };
    }

    const fallback = LOCAL_RISK_RESPONSES.get(userId) || null;
    return { data: fallback, error: null };
  } catch (err) {
    const fallback = LOCAL_RISK_RESPONSES.get(userId) || null;
    return { data: fallback, error: null };
  }
}

/**
 * Saves a completed risk tolerance evaluation to Supabase.
 */
export async function saveRiskToleranceResponse(
  userId: string,
  answers: Record<string, number>,
  evaluation: RiskToleranceEvaluation,
): Promise<{ data: RiskQuizResponseRecord | null; error: Error | null }> {
  if (!userId) {
    return { data: null, error: new Error("User ID is required.") };
  }

  const recordPayload: RiskQuizResponseRecord = {
    id: `local-rt-${Date.now()}`,
    user_id: userId,
    answers,
    score: evaluation.score,
    profile_label: evaluation.profileLabel,
    profile_band: evaluation.profileBand,
    computed_at: new Date().toISOString(),
  };

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("risk_tolerance_responses")
      .insert({
        user_id: userId,
        answers,
        score: evaluation.score,
        profile_label: evaluation.profileLabel,
        profile_band: evaluation.profileBand,
      })
      .select()
      .single();

    if (error) {
      // Store locally as fallback
      LOCAL_RISK_RESPONSES.set(userId, recordPayload);
      return { data: recordPayload, error: null };
    }

    const saved = data as RiskQuizResponseRecord;
    LOCAL_RISK_RESPONSES.set(userId, saved);
    return { data: saved, error: null };
  } catch (err) {
    LOCAL_RISK_RESPONSES.set(userId, recordPayload);
    return { data: recordPayload, error: null };
  }
}

