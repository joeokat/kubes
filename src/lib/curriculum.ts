import type {
    Lesson,
    QuizResult,
    UserLessonProgress,
} from "../types/curriculum";

function getSupabase() {
  try {
    return require("./supabase").supabase;
  } catch {
    return null;
  }
}

export const INVESTING_101_LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    slug: "intro-to-investing",
    category: "Foundations",
    title: "What is Investing? Saving vs. Investing vs. Speculating",
    order_index: 1,
    read_time_mins: 4,
    is_free: true,
    price_ghs: 0.0,
    summary:
      "Understand the vital distinctions between preserving cash, deploying capital for productive growth, and taking uncalculated gambles.",
    content: [
      "Before putting a single cedi or dollar to work, you need absolute clarity on what investing actually is — and just as importantly, what it is not.",
      "Saving is the act of putting money aside in a safe, liquid place so it is available when you need it. An emergency fund in a dedicated account is saving. The primary goal of saving is preservation and liquidity, not growth.",
      "Investing is committing capital to productive assets — such as businesses (equities) or loans to creditworthy institutions (bonds/treasuries) — with the reasonable expectation of generating an income or capital growth over time. When you invest, your money goes to work in an engine of economic production.",
      "Speculating (or gambling) is deploying money into price movements driven solely by hope or hype, where the underlying asset produces no cash flow, earnings, or intrinsic value. If your return depends entirely on finding someone else willing to pay more tomorrow for an asset that generates nothing today, you are speculating, not investing.",
      "A healthy financial life requires all three distinctions: you build your savings cushion first, invest patiently for the long term, and eliminate speculation entirely from your core wealth plan.",
    ],
    callout: {
      title: "Core Rule of Capital",
      body: "Investors participate in business earnings and economic growth. Speculators gamble on market mood swings. Kubes teaches only the former.",
    },
    quiz: [
      {
        id: 101,
        question: "What is the primary objective of cash savings?",
        options: [
          { id: 1, text: "To double your money every year" },
          { id: 2, text: "Preservation of capital and immediate liquidity" },
          { id: 3, text: "To buy speculative new tokens" },
          { id: 4, text: "To beat stock market returns" },
        ],
        correctOptionId: 2,
        explanation:
          "Savings are designed to stay safe, intact, and accessible when urgent emergencies arise, not to chase high returns.",
      },
      {
        id: 102,
        question: "Which of the following represents genuine investing?",
        options: [
          { id: 1, text: "Putting money into a lottery ticket" },
          { id: 2, text: "Buying shares of a productive, profitable business" },
          { id: 3, text: "Trusting an anonymous WhatsApp signal channel" },
          { id: 4, text: "Hoarding physical cash under a mattress" },
        ],
        correctOptionId: 2,
        explanation:
          "Investing commits capital to productive economic activities that generate real revenue, earnings, or interest.",
      },
      {
        id: 103,
        question: "How does speculating fundamentally differ from investing?",
        options: [
          { id: 1, text: "Speculating is always risk-free" },
          { id: 2, text: "Investing guarantees overnight riches" },
          {
            id: 3,
            text: "Speculating relies on price hype rather than cash flow or intrinsic business growth",
          },
          { id: 4, text: "There is no difference between them" },
        ],
        correctOptionId: 3,
        explanation:
          "Speculation bets on short-term price momentum without relying on underlying cash generation or audited balance sheets.",
      },
    ],
  },
  {
    id: "lesson-2",
    slug: "power-of-compounding",
    category: "Foundations",
    title: "The Power of Compounding: How Time Does the Heavy Lifting",
    order_index: 2,
    read_time_mins: 5,
    is_free: false,
    price_ghs: 0.5,
    summary:
      "Discover the mathematical engine that transforms small, consistent contributions into exponential long-term wealth.",
    content: [
      "Albert Einstein famously called compound interest the eighth wonder of the world: 'He who understands it, earns it; he who doesn't, pays it.'",
      "Simple interest is calculated solely on your original principal. If you deposit 1,000 and earn 10% each year in simple interest, you earn 100 every year — a straight, linear line.",
      "Compound interest, however, is interest earned on top of previously earned interest. In year one, your 1,000 earns 100, bringing your total to 1,100. In year two, you earn 10% not on 1,000, but on 1,100 — giving you 110. In year three, you earn 10% on 1,210.",
      "In the early years, the curve looks flat and unimpressive. But after 10, 15, or 20 years, the earnings outpace your original contributions. The growth turns vertical.",
      "The single greatest variable in compounding is not your initial sum, nor is it finding the highest-risk return: it is TIME. The earlier you start and the longer you leave the snowball rolling uninterrupted, the less heavy lifting your paycheck has to do.",
    ],
    callout: {
      title: "The Snowball Law",
      body: "Compounding demands patience. An investor who saves modestly for 25 years almost always outperforms someone who saves aggressively for only 5 years.",
    },
    quiz: [
      {
        id: 201,
        question: "What is compound interest?",
        options: [
          { id: 1, text: "Interest calculated only on your starting deposit" },
          {
            id: 2,
            text: "Interest earned on both your principal and previous earnings",
          },
          { id: 3, text: "A fee charged by banks on foreign transfers" },
          { id: 4, text: "A tax levied on local stock exchanges" },
        ],
        correctOptionId: 2,
        explanation:
          "Compound growth accelerates because your accumulated earnings continuously earn returns of their own.",
      },
      {
        id: 202,
        question:
          "What is the single most powerful factor in maximizing compounding?",
        options: [
          { id: 1, text: "Timing the exact day the market hits bottom" },
          { id: 2, text: "Time horizon and allowing uninterrupted growth" },
          { id: 3, text: "Borrowing debt to buy more shares" },
          { id: 4, text: "Frequently buying and selling every week" },
        ],
        correctOptionId: 2,
        explanation:
          "Time gives exponential curves their steep trajectory. The longer your horizon, the larger the snowball effect.",
      },
      {
        id: 203,
        question: "Why do many beginners fail to benefit from compounding?",
        options: [
          { id: 1, text: "Compounding is outlawed in modern banking" },
          {
            id: 2,
            text: "They interrupt the process too early due to impatience or panic",
          },
          { id: 3, text: "It only works for billionaires" },
          { id: 4, text: "Compounding stops working after 1 year" },
        ],
        correctOptionId: 2,
        explanation:
          "Because compounding looks slow in the first few years, undisciplined investors cash out or change strategies before the curve takes off.",
      },
    ],
  },
  {
    id: "lesson-3",
    slug: "inflation-purchasing-power",
    category: "Macro Concepts",
    title: "Inflation & Purchasing Power: The Hidden Cost of Inaction",
    order_index: 3,
    read_time_mins: 4,
    is_free: false,
    price_ghs: 0.5,
    summary:
      "Learn why keeping all your wealth in physical cash or zero-interest accounts guarantees a loss in purchasing power over time.",
    content: [
      "Most people believe that leaving cash in a bank account or locked in a safe is completely risk-free. In reality, cash held over long periods carries a 100% guarantee of losing purchasing power.",
      "Inflation is the gradual increase in the general prices of goods and services over time. Think about what a basket of groceries, a bag of cement, or a gallon of fuel cost five years ago compared to today. The paper note has the same number printed on it, but it buys significantly less.",
      "Nominal return is the raw percentage increase on your money. Real return is your nominal return minus the inflation rate. If your money earns 8% interest, but inflation is 15%, your real return is negative 7%. You are mathematically poorer in real terms.",
      "The purpose of investing is not to gamble or show off — it is to defend your life's labor from being eroded by the persistent decline of fiat currency purchasing power.",
      "To protect your future self, you need assets whose earnings and cash flows naturally adjust with prices: productive equities, index funds, and real income-producing instruments.",
    ],
    callout: {
      title: "Real vs. Nominal",
      body: "Never look at an interest rate in isolation. Always subtract the inflation rate to discover whether your purchasing power is actually expanding or shrinking.",
    },
    quiz: [
      {
        id: 301,
        question: "What does inflation do to physical cash over time?",
        options: [
          { id: 1, text: "It multiplies the cash value automatically" },
          {
            id: 2,
            text: "It steadily erodes the purchasing power of the money",
          },
          { id: 3, text: "It locks the price of groceries permanently" },
          { id: 4, text: "It eliminates all investment risk" },
        ],
        correctOptionId: 2,
        explanation:
          "Inflation causes goods and services to become more expensive, meaning each unit of currency buys fewer real things over time.",
      },
      {
        id: 302,
        question:
          "If an account earns 10% nominal interest while inflation is 14%, what is the real return?",
        options: [
          { id: 1, text: "+24% real return" },
          { id: 2, text: "+4% real return" },
          { id: 3, text: "-4% real return (loss in purchasing power)" },
          { id: 4, text: "0% break-even" },
        ],
        correctOptionId: 3,
        explanation:
          "Real return = Nominal return (10%) - Inflation (14%) = -4%. Your purchasing power decreased despite earning 10%.",
      },
      {
        id: 303,
        question:
          "What is the most effective long-term defense against inflation?",
        options: [
          { id: 1, text: "Holding paper banknotes at home" },
          {
            id: 2,
            text: "Investing in productive businesses that can adjust prices with inflation",
          },
          { id: 3, text: "Stopping all savings entirely" },
          { id: 4, text: "Borrowing at high interest rates" },
        ],
        correctOptionId: 2,
        explanation:
          "Productive businesses increase prices and earnings as inflation rises, protecting long-term shareholders.",
      },
    ],
  },
  {
    id: "lesson-4",
    slug: "ghana-stock-exchange",
    category: "Local Markets",
    title: "The Ghana Stock Exchange (GSE): Structure, Equities & T-Bills",
    order_index: 4,
    read_time_mins: 6,
    is_free: false,
    price_ghs: 0.5,
    summary:
      "A complete guide to the local Ghanaian capital market: listed equities, Government of Ghana treasury bills, and licensed SEC brokers.",
    content: [
      "The Ghana Stock Exchange (GSE), established in Accra in 1989 and opened for trading in 1990, is the official capital market of Ghana. It allows everyday citizens to buy fractional ownership in local and multinational enterprises operating across the country.",
      "When you buy a share of an enterprise on the GSE — such as MTN Ghana (MTNGH), GCB Bank, Standard Chartered Ghana, or Total Petroleum — you become an equity co-owner. You are entitled to participate in dividends declared from company profits and any long-term share price appreciation.",
      "Alongside equities, Ghanaian investors frequently utilize Government of Ghana Treasury Bills (T-Bills: 91-day, 182-day, and 364-day). T-Bills are short-term debt instruments backed by the full faith and credit of the Republic of Ghana, providing fixed interest yields.",
      "To trade shares on the GSE, you must open a Central Securities Depository (CSD) account through an SEC-licensed stockbroker (such as IC Securities, Databank, Stanbic, or Cal Brokers). You do not hand cash to individuals on WhatsApp or Telegram; your transactions are registered electronically under your unique CSD number.",
      "Investing locally in cedis builds our domestic capital formation while giving you direct claims on businesses providing telecommunications, banking, and energy to millions of Ghanaians daily.",
    ],
    callout: {
      title: "Ghana Context: Central Securities Depository (CSD)",
      body: "All GSE transactions must clear through the official CSD. Never transfer funds to personal mobile money numbers claiming to trade shares on your behalf.",
      isGhanaSpecific: true,
    },
    quiz: [
      {
        id: 401,
        question: "What does owning a share of a company on the GSE mean?",
        options: [
          { id: 1, text: "You are an employee of the firm" },
          {
            id: 2,
            text: "You own fractional equity in the business and are entitled to dividends when declared",
          },
          { id: 3, text: "You must run the daily store operations" },
          {
            id: 4,
            text: "You are personally liable for all bank debts of the company",
          },
        ],
        correctOptionId: 2,
        explanation:
          "Equities represent fractional ownership. As a shareholder, you participate in the company's financial success via dividends and appreciation.",
      },
      {
        id: 402,
        question:
          "What institution officially records your shareholdings in Ghana?",
        options: [
          { id: 1, text: "A WhatsApp group admin" },
          { id: 2, text: "The Central Securities Depository (CSD)" },
          { id: 3, text: "An overseas foreign exchange broker" },
          { id: 4, text: "Your local postal office" },
        ],
        correctOptionId: 2,
        explanation:
          "The Central Securities Depository (CSD) is the electronic registry established to safeguard and record securities ownership in Ghana.",
      },
      {
        id: 403,
        question:
          "What is a key difference between GSE equities and Government of Ghana T-Bills?",
        options: [
          {
            id: 1,
            text: "T-Bills represent ownership; shares represent loans",
          },
          {
            id: 2,
            text: "T-Bills are fixed-income government debt; shares are variable equity in businesses",
          },
          { id: 3, text: "Equities can never lose value" },
          { id: 4, text: "T-Bills are only traded in US Dollars" },
        ],
        correctOptionId: 2,
        explanation:
          "T-Bills are short-term loans to the government yielding fixed interest, whereas equities represent fractional company ownership with variable returns.",
      },
    ],
  },
  {
    id: "lesson-5",
    slug: "us-stock-markets",
    category: "Global Markets",
    title: "Investing in Global & US Markets from Ghana (ETFs & S&P 500)",
    order_index: 5,
    read_time_mins: 6,
    is_free: false,
    price_ghs: 0.5,
    summary:
      "How Ghanaian learners can broaden their horizons to US capital markets, global index funds, and currency diversification.",
    content: [
      "The United States stock market represents over 40% of the world's total equity capitalization. For Ghanaian learners, understanding global markets provides geographic diversification and access to innovation leaders worldwide.",
      "The two primary exchanges in the US are the New York Stock Exchange (NYSE) and the NASDAQ. Rather than trying to pick individual winning stocks, long-term investors overwhelmingly use Index Funds and Exchange Traded Funds (ETFs).",
      "An ETF is a basket of hundreds of companies traded as a single unit on the exchange. The most famous benchmark is the S&P 500, which holds 500 of the largest, most profitable publicly traded corporations in the United States (including Microsoft, Apple, Google, and Berkshire Hathaway).",
      "When you purchase an S&P 500 ETF (such as VOO or SPY), you instantly own a tiny slice of all 500 companies. Even if several underperform, the collective innovation and earnings of the US economy drive the index forward.",
      "As a Ghanaian investor, you must also be mindful of foreign exchange (FX) rates between the Ghana Cedi (GHS) and the US Dollar (USD), regulatory compliance with the Bank of Ghana, and international dividend withholding tax rules (such as the standard 30% US nonresident tax rate).",
    ],
    callout: {
      title: "Ghana Context: Currency & Global Access",
      body: "Holding US index funds provides dollar exposure, which can hedge against domestic currency depreciation. However, always account for international transfer and conversion fees.",
      isGhanaSpecific: true,
    },
    quiz: [
      {
        id: 501,
        question: "What is an Exchange Traded Fund (ETF)?",
        options: [
          { id: 1, text: "A high-risk crypto scheme" },
          {
            id: 2,
            text: "A basket of many securities that trades like a single stock on an exchange",
          },
          { id: 3, text: "A physical loan issued by a local bank" },
          { id: 4, text: "An insurance policy against vehicle damage" },
        ],
        correctOptionId: 2,
        explanation:
          "An ETF bundles hundreds or thousands of underlying stocks or bonds into a single tradable fund, giving instant diversification.",
      },
      {
        id: 502,
        question: "What does the S&P 500 index measure?",
        options: [
          { id: 1, text: "The performance of 500 leading US public companies" },
          { id: 2, text: "The top 500 small businesses in Accra" },
          { id: 3, text: "The price of crude oil and cocoa" },
          { id: 4, text: "The daily exchange rate of the US Dollar" },
        ],
        correctOptionId: 1,
        explanation:
          "The S&P 500 represents approximately 80% of the total US market capitalization and is the world's leading equity benchmark.",
      },
      {
        id: 503,
        question:
          "What international factor must a Ghanaian investor specifically keep in mind when investing in US assets?",
        options: [
          {
            id: 1,
            text: "Ghanaian investors are legally barred from reading US news",
          },
          {
            id: 2,
            text: "Currency exchange (USD/GHS) fluctuation and international tax withholding",
          },
          { id: 3, text: "US stocks only pay dividends in physical gold" },
          { id: 4, text: "There are no factors to consider" },
        ],
        correctOptionId: 2,
        explanation:
          "Investing internationally introduces exchange rate fluctuations between Cedis and Dollars, as well as foreign withholding tax on dividends.",
      },
    ],
  },
  {
    id: "lesson-6",
    slug: "risk-and-diversification",
    category: "Portfolio Principles",
    title: "Risk, Volatility & Asset Allocation (Educational Framing)",
    order_index: 6,
    read_time_mins: 5,
    is_free: false,
    price_ghs: 0.5,
    summary:
      "Understand the difference between permanent loss of capital and temporary price fluctuations, and why asset allocation protects your future.",
    content: [
      "In finance, people often conflate volatility with risk. They are not the same thing.",
      "Volatility is the regular, normal fluctuation of prices in the market. Stock prices fluctuate every day based on news, investor sentiment, and economic cycles. Volatility is the price of admission for long-term equity returns.",
      "Risk, on the other hand, is the probability of suffering a permanent, irreversible loss of your hard-earned capital. You suffer permanent loss when you buy a fraudulent scheme, invest in a bankrupt business with no assets, or panic and sell during a temporary downturn.",
      "Diversification is the single most reliable hedge against catastrophic risk. If you put 100% of your net worth into a single company and that company collapses, you lose everything. But if you hold a diversified collection of businesses, a failure in one company is offset by growth in the remaining majority.",
      "Asset allocation — the division of your funds between defensive assets (cash and treasury bills) and growth assets (local and global equities) — dictates over 90% of your long-term investment experience.",
    ],
    callout: {
      title: "Compliance Notice",
      body: "This lesson explains diversification as an educational principle. Kubes never recommends specific assets, stock picks, or personalized portfolio splits.",
    },
    quiz: [
      {
        id: 601,
        question: "How does real risk differ from normal market volatility?",
        options: [
          { id: 1, text: "Volatility is permanent; risk is imaginary" },
          {
            id: 2,
            text: "Risk is permanent loss of capital; volatility is temporary price fluctuation",
          },
          { id: 3, text: "Risk only happens in foreign markets" },
          { id: 4, text: "There is no difference between them" },
        ],
        correctOptionId: 2,
        explanation:
          "Volatility reflects normal market price ups and downs. Real risk is permanent capital loss where money cannot be recovered.",
      },
      {
        id: 602,
        question:
          "Why is diversification considered essential for long-term investors?",
        options: [
          {
            id: 1,
            text: "It guarantees you will never experience price fluctuations",
          },
          {
            id: 2,
            text: "It ensures a collapse in any single company does not destroy your entire wealth",
          },
          { id: 3, text: "It allows you to avoid paying brokerage fees" },
          {
            id: 4,
            text: "It is required by the government to open a bank account",
          },
        ],
        correctOptionId: 2,
        explanation:
          "Diversification spreads your risk across sectors and assets so that the demise of one company cannot wipe out your financial life.",
      },
      {
        id: 603,
        question: "What is asset allocation?",
        options: [
          {
            id: 1,
            text: "The strategy of dividing capital across different asset classes like equities and cash/bonds",
          },
          {
            id: 2,
            text: "Borrowing money from family to buy speculative coins",
          },
          { id: 3, text: "Timing the exact hour to sell shares" },
          {
            id: 4,
            text: "Putting all your savings into a single high-interest bank",
          },
        ],
        correctOptionId: 1,
        explanation:
          "Asset allocation balances growth and stability by distributing capital across different categories suited to your time horizon.",
      },
    ],
  },
  {
    id: "lesson-7",
    slug: "building-your-strategy",
    category: "Execution & Habits",
    title: "Creating Your Long-Term Plan & Avoiding Emotional Pitfalls",
    order_index: 7,
    read_time_mins: 5,
    is_free: false,
    price_ghs: 0.5,
    summary:
      "Synthesize your knowledge into a clear, disciplined routine: automating contributions, tuning out market noise, and recognizing scams.",
    content: [
      "Successful investing is far less about high IQ or complex financial modeling than it is about emotional temperament and unwavering behavioral consistency.",
      "Most financial catastrophes happen when investors abandon their calm discipline: chasing hot tips, attempting to time market crashes, or falling victim to high-yield investment schemes promising 'guaranteed 30% monthly returns.'",
      "Rule number one of avoiding scams: If an investment promises high returns with zero risk, it is fraudulent. No exceptions. Risk and return are mathematical twins; higher potential return always requires higher uncertainty.",
      "The winning formula used by the most successful everyday investors worldwide is simple: Dollar-Cost Averaging (or Cedi-Cost Averaging). This means investing a fixed amount of money at regular intervals (such as every month on payday), regardless of whether markets are up, down, or flat.",
      "When prices are low, your fixed contribution buys more shares. When prices are high, it buys fewer. Over decades, this mechanical habit completely removes emotion, builds unstoppable momentum, and lets compounding work its mathematical magic.",
    ],
    callout: {
      title: "The Golden Rule of Red Flags",
      body: "High returns with 'guaranteed zero risk' do not exist in genuine finance. Anyone promising you guaranteed double-digit monthly profits is running a Ponzi scheme.",
    },
    quiz: [
      {
        id: 701,
        question: "What is Dollar-Cost Averaging (or Cedi-Cost Averaging)?",
        options: [
          {
            id: 1,
            text: "Investing a fixed amount of money on a regular schedule regardless of price",
          },
          { id: 2, text: "Borrowing dollars to buy cedis" },
          {
            id: 3,
            text: "Waiting for the exact lowest market price before investing",
          },
          { id: 4, text: "Selling all holdings whenever the news is negative" },
        ],
        correctOptionId: 1,
        explanation:
          "Regular, automated contributions eliminate emotional market timing and take advantage of price fluctuations over decades.",
      },
      {
        id: 702,
        question: "What is an unmistakable warning sign of a financial scam?",
        options: [
          {
            id: 1,
            text: "Clear documentation of risks and audited financial statements",
          },
          {
            id: 2,
            text: "Promises of 'guaranteed high returns with zero risk'",
          },
          {
            id: 3,
            text: "Regulation by the Securities and Exchange Commission",
          },
          { id: 4, text: "Holding investments for more than 5 years" },
        ],
        correctOptionId: 2,
        explanation:
          "Risk and return are inseparable. Any entity promising guaranteed high profits without risk is fundamentally fraudulent.",
      },
      {
        id: 703,
        question:
          "What is the ultimate secret to long-term investment success?",
        options: [
          { id: 1, text: "Trading in and out of the market daily" },
          {
            id: 2,
            text: "Emotional temperament, disciplined saving habits, and patient time in the market",
          },
          { id: 3, text: "Following anonymous social media influencers" },
          { id: 4, text: "Avoiding all forms of savings" },
        ],
        correctOptionId: 2,
        explanation:
          "Consistency and patient temperament beat market timing every single time over long investment horizons.",
      },
    ],
  },
];

export function getAllLessons(): Lesson[] {
  return INVESTING_101_LESSONS;
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return INVESTING_101_LESSONS.find((l) => l.slug === slug);
}

export function getLessonById(id: string): Lesson | undefined {
  return INVESTING_101_LESSONS.find((l) => l.id === id);
}

export function gradeQuiz(
  lesson: Lesson,
  userAnswers: Record<number, number>,
): QuizResult {
  const details = lesson.quiz.map((q) => {
    const userAnswerId = userAnswers[q.id];
    const isCorrect = userAnswerId === q.correctOptionId;
    return {
      questionId: q.id,
      userAnswerId,
      correctAnswerId: q.correctOptionId,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const score = details.filter((d) => d.isCorrect).length;
  const totalQuestions = lesson.quiz.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = score >= 2; // At least 2 out of 3 correct to pass

  return {
    lessonId: lesson.id,
    score,
    totalQuestions,
    percentage,
    passed,
    details,
  };
}

export function isLessonUnlocked(
  lesson: Lesson,
  isPremium: boolean,
  unlockedLessonIds: string[] = [],
): boolean {
  if (lesson.is_free) return true;
  if (isPremium) return true;
  return unlockedLessonIds.includes(lesson.id);
}

export function canAccessLesson(
  lessonOrderIndex: number,
  completedLessonIds: string[],
): boolean {
  if (lessonOrderIndex <= 1) return true;
  const prevLesson = INVESTING_101_LESSONS.find(
    (l) => l.order_index === lessonOrderIndex - 1,
  );
  if (!prevLesson) return true;
  return completedLessonIds.includes(prevLesson.id);
}

// In-memory progress cache for offline / test runner
const memoryProgress: Record<string, UserLessonProgress[]> = {};

export async function fetchUserProgress(
  userId: string,
): Promise<UserLessonProgress[]> {
  try {
    const client = getSupabase();
    if (!client) {
      return memoryProgress[userId] || [];
    }

    const { data, error } = await client
      .from("lesson_progress")
      .select("lesson_id, completed_at, quiz_score")
      .eq("user_id", userId);

    if (error) {
      console.warn(
        "Error fetching lesson progress from Supabase:",
        error.message,
      );
      return memoryProgress[userId] || [];
    }

    const progress = (data || []) as UserLessonProgress[];
    memoryProgress[userId] = progress;
    return progress;
  } catch (err) {
    console.warn("Unexpected progress fetch error:", err);
    return memoryProgress[userId] || [];
  }
}

export async function saveLessonProgress(
  userId: string,
  lessonId: string,
  quizScore: number,
): Promise<{ error: Error | null }> {
  try {
    const record: UserLessonProgress = {
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      quiz_score: quizScore,
    };

    // Update in-memory cache first
    const existing = memoryProgress[userId] || [];
    const filtered = existing.filter((p) => p.lesson_id !== lessonId);
    memoryProgress[userId] = [...filtered, record];

    const client = getSupabase();
    if (!client) {
      return { error: null }; // Test / offline fallback
    }

    // Attempt database write
    const { error } = await client.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        quiz_score: quizScore,
        completed_at: record.completed_at,
      },
      { onConflict: "user_id,lesson_id" },
    );

    if (error) {
      console.warn(
        "Could not save lesson progress to Supabase:",
        error.message,
      );
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
