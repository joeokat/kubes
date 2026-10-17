export interface BudgetCategory {
  id: string;
  label: string;
  percent: number; // 0 - 100
  color: string;
  icon: string;
}

export interface BudgetFramework {
  id?: string;
  user_id?: string;
  name: string;
  categories: BudgetCategory[];
  is_active: boolean;
  monthly_income?: number;
  created_at?: string;
}

export interface Expense {
  id?: string;
  user_id: string;
  amount: number;
  category_label: string;
  note?: string | null;
  spent_at: string; // YYYY-MM-DD
  created_at?: string;
}

export type SpendMeterStatus = "under" | "near" | "over";

export interface CategorySpendSummary {
  category: BudgetCategory;
  budgetAmount: number;
  spentAmount: number;
  percentageUsed: number;
  remainingAmount: number;
  status: SpendMeterStatus;
}

export interface BudgetWarning {
  categoryLabel: string;
  allocatedAmount: number;
  spentAmount: number;
  overspendAmount: number;
  overspendPercentage: number;
}

/**
 * Founder's signature 55/5/10/15/15 budgeting split preset per SOP §8.
 */
export const DEFAULT_FOUNDER_CATEGORIES: BudgetCategory[] = [
  {
    id: "essentials",
    label: "Essentials (55%)",
    percent: 55,
    color: "#10B981", // Emerald
    icon: "🏠",
  },
  {
    id: "free_spending",
    label: "Free Spending (5%)",
    percent: 5,
    color: "#F59E0B", // Amber
    icon: "🍿",
  },
  {
    id: "debt_or_invest",
    label: "Debt Repayment / Investing (10%)",
    percent: 10,
    color: "#3B82F6", // Blue
    icon: "💳",
  },
  {
    id: "short_term",
    label: "Short-Term Goals (15%)",
    percent: 15,
    color: "#8B5CF6", // Purple
    icon: "🎯",
  },
  {
    id: "long_term",
    label: "Long-Term Wealth Building (15%)",
    percent: 15,
    color: "#6366F1", // Indigo
    icon: "📈",
  },
];

/**
 * Standard 50/30/20 framework preset per SOP §8.
 */
export const STANDARD_50_30_20_CATEGORIES: BudgetCategory[] = [
  {
    id: "needs",
    label: "Needs (50%)",
    percent: 50,
    color: "#10B981",
    icon: "🏠",
  },
  {
    id: "wants",
    label: "Wants (30%)",
    percent: 30,
    color: "#F59E0B",
    icon: "🍿",
  },
  {
    id: "savings",
    label: "Savings & Investments (20%)",
    percent: 20,
    color: "#6366F1",
    icon: "📈",
  },
];

export const DEFAULT_MONTHLY_INCOME = 3000;

/**
 * Validates that categories add up to exactly 100%.
 */
export function validateFrameworkCategories(categories: BudgetCategory[]): {
  valid: boolean;
  sum: number;
  error?: string;
} {
  const sum = categories.reduce(
    (acc, cat) => acc + (Number(cat.percent) || 0),
    0,
  );
  if (Math.round(sum) !== 100) {
    return {
      valid: false,
      sum,
      error: `Category allocations must total exactly 100%. Current total is ${sum}%.`,
    };
  }
  return { valid: true, sum: 100 };
}

/**
 * Calculates allocation amount given monthly income and category percentage.
 */
export function calculateCategoryBudget(
  monthlyIncome: number,
  percent: number,
): number {
  if (monthlyIncome <= 0 || percent <= 0) return 0;
  return Number(((monthlyIncome * percent) / 100).toFixed(2));
}

/**
 * Aggregates spent amount for a specific category from expenses.
 */
export function calculateCategorySpend(
  expenses: Expense[],
  categoryLabel: string,
): number {
  const total = expenses
    .filter(
      (e) =>
        e.category_label.trim().toLowerCase() ===
        categoryLabel.trim().toLowerCase(),
    )
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return Number(total.toFixed(2));
}

/**
 * Determines meter status based on percentage of allocation consumed:
 * - <= 80%: "under" (healthy)
 * - > 80% and <= 100%: "near" (approaching limit)
 * - > 100%: "over" (exceeded allocation)
 */
export function calculateSpendMeterStatus(
  spent: number,
  budgetAmount: number,
): SpendMeterStatus {
  if (budgetAmount <= 0) return spent > 0 ? "over" : "under";
  const ratio = spent / budgetAmount;
  if (ratio > 1.0) return "over";
  if (ratio > 0.8) return "near";
  return "under";
}

/**
 * Computes high-level summaries for all categories in a framework.
 */
export function computeBudgetSummaries(
  framework: BudgetFramework,
  monthlyIncome: number,
  expenses: Expense[],
): CategorySpendSummary[] {
  return framework.categories.map((cat) => {
    const budgetAmount = calculateCategoryBudget(monthlyIncome, cat.percent);
    const spentAmount = calculateCategorySpend(expenses, cat.label);
    const percentageUsed =
      budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
    const remainingAmount = Number((budgetAmount - spentAmount).toFixed(2));
    const status = calculateSpendMeterStatus(spentAmount, budgetAmount);

    return {
      category: cat,
      budgetAmount,
      spentAmount,
      percentageUsed,
      remainingAmount,
      status,
    };
  });
}

/**
 * Detects categories that have exceeded their planned budget allocations.
 */
export function generateBudgetWarnings(
  framework: BudgetFramework,
  monthlyIncome: number,
  expenses: Expense[],
): BudgetWarning[] {
  const warnings: BudgetWarning[] = [];
  const summaries = computeBudgetSummaries(framework, monthlyIncome, expenses);

  for (const s of summaries) {
    if (s.status === "over") {
      const overspendAmount = Number(
        (s.spentAmount - s.budgetAmount).toFixed(2),
      );
      const overspendPercentage =
        s.budgetAmount > 0
          ? Math.round((overspendAmount / s.budgetAmount) * 100)
          : 100;

      warnings.push({
        categoryLabel: s.category.label,
        allocatedAmount: s.budgetAmount,
        spentAmount: s.spentAmount,
        overspendAmount,
        overspendPercentage,
      });
    }
  }

  return warnings;
}

/**
 * Produces plain-language recommendations based on the user's actual spending vs framework.
 * Strictly non-advisory per SOP §7.
 */
export function generateBudgetRecommendations(
  framework: BudgetFramework,
  monthlyIncome: number,
  expenses: Expense[],
): string[] {
  const recommendations: string[] = [];
  const summaries = computeBudgetSummaries(framework, monthlyIncome, expenses);
  const totalSpent = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );

  // Overall cash flow comparison
  if (monthlyIncome > 0) {
    if (totalSpent > monthlyIncome) {
      recommendations.push(
        `Total monthly spending has exceeded your declared income by ${Math.round(
          ((totalSpent - monthlyIncome) / monthlyIncome) * 100,
        )}%. Consider pausing discretionary items until the next period.`,
      );
    } else if (totalSpent >= monthlyIncome * 0.85) {
      recommendations.push(
        "You have utilized over 85% of your total monthly income allocation. Pace remaining expenses to stay within your framework.",
      );
    }
  }

  // Category specific recommendations
  for (const s of summaries) {
    if (s.status === "over") {
      recommendations.push(
        `${s.category.label} is currently ${s.percentageUsed}% of planned allocation (${Math.abs(
          s.remainingAmount,
        )} over). Review non-essential purchases in this bucket.`,
      );
    } else if (s.status === "near") {
      recommendations.push(
        `${s.category.label} is approaching its monthly cap (${s.percentageUsed}% used). Only ${s.remainingAmount} remains available.`,
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Your expenses are tracking comfortably within your allocated percentages across all categories.",
    );
  }

  return recommendations;
}

/**
 * Storage key helper for local offline caching
 */
function getFrameworkStorageKey(userId: string): string {
  return `@kubes_budget_framework_${userId}`;
}

function getExpensesStorageKey(userId: string): string {
  return `@kubes_expenses_${userId}`;
}

/**
 * Fetches the active budget framework for the user, falling back to Founder's 55/5/10/15/15 model.
 */
export async function fetchActiveFramework(
  userId: string,
): Promise<BudgetFramework> {
  const defaultFramework: BudgetFramework = {
    name: "Founder's 55/5/10/15/15 Framework",
    categories: DEFAULT_FOUNDER_CATEGORIES,
    is_active: true,
    monthly_income: DEFAULT_MONTHLY_INCOME,
  };

  // Try local cache
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const cached = await AsyncStorage.getItem(getFrameworkStorageKey(userId));
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (_e) {}

  // Fetch from Supabase
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("budget_frameworks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return defaultFramework;

    const framework: BudgetFramework = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      categories:
        (data.categories as BudgetCategory[]) || DEFAULT_FOUNDER_CATEGORIES,
      is_active: data.is_active,
      monthly_income: DEFAULT_MONTHLY_INCOME,
      created_at: data.created_at,
    };

    try {
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      await AsyncStorage.setItem(
        getFrameworkStorageKey(userId),
        JSON.stringify(framework),
      );
    } catch (_e) {}

    return framework;
  } catch (_e) {
    return defaultFramework;
  }
}

/**
 * Saves or updates a user's budget framework in Supabase and local cache.
 */
export async function saveFramework(
  userId: string,
  framework: BudgetFramework,
): Promise<{ data: BudgetFramework | null; error: Error | null }> {
  const validation = validateFrameworkCategories(framework.categories);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.error) };
  }

  // Update local storage
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    await AsyncStorage.setItem(
      getFrameworkStorageKey(userId),
      JSON.stringify(framework),
    );
  } catch (_e) {}

  // Persist to Supabase
  try {
    const { supabase } = await import("./supabase");

    // Deactivate previous active frameworks
    await supabase
      .from("budget_frameworks")
      .update({ is_active: false })
      .eq("user_id", userId);

    const { data, error } = await supabase
      .from("budget_frameworks")
      .insert({
        user_id: userId,
        name: framework.name,
        categories: framework.categories,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        categories: data.categories as BudgetCategory[],
        is_active: data.is_active,
        monthly_income: framework.monthly_income,
        created_at: data.created_at,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Fetches expenses for the user for the current month or specified date range.
 */
export async function fetchExpenses(
  userId: string,
  monthStr?: string, // e.g. "2026-10"
): Promise<Expense[]> {
  const targetMonth = monthStr || new Date().toISOString().substring(0, 7);
  const startDay = `${targetMonth}-01`;
  const endDay = `${targetMonth}-31`;

  // Check local cache
  let cachedExpenses: Expense[] = [];
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const cached = await AsyncStorage.getItem(getExpensesStorageKey(userId));
    if (cached) {
      cachedExpenses = JSON.parse(cached);
    }
  } catch (_e) {}

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .gte("spent_at", startDay)
      .lte("spent_at", endDay)
      .order("spent_at", { ascending: false });

    if (error || !data) {
      return cachedExpenses.filter(
        (e) => e.spent_at >= startDay && e.spent_at <= endDay,
      );
    }

    const expenses = data as Expense[];
    try {
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      await AsyncStorage.setItem(
        getExpensesStorageKey(userId),
        JSON.stringify(expenses),
      );
    } catch (_e) {}

    return expenses;
  } catch (_e) {
    return cachedExpenses;
  }
}

/**
 * Logs an expense to Supabase and cache.
 * Must confirm database write before treating as complete (AGENTS.md §3 & §6).
 */
export async function logExpense(
  expense: Omit<Expense, "id" | "created_at">,
): Promise<{ data: Expense | null; error: Error | null }> {
  if (expense.amount <= 0) {
    return {
      data: null,
      error: new Error("Expense amount must be greater than zero."),
    };
  }
  if (!expense.category_label || expense.category_label.trim().length === 0) {
    return {
      data: null,
      error: new Error("Please specify a category for this expense."),
    };
  }

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: expense.user_id,
        amount: expense.amount,
        category_label: expense.category_label,
        note: expense.note || null,
        spent_at: expense.spent_at,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const savedExpense = data as Expense;

    // Update local cache
    try {
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const key = getExpensesStorageKey(expense.user_id);
      const existing = await AsyncStorage.getItem(key);
      const list: Expense[] = existing ? JSON.parse(existing) : [];
      list.unshift(savedExpense);
      await AsyncStorage.setItem(key, JSON.stringify(list));
    } catch (_e) {}

    return { data: savedExpense, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Deletes an expense by ID with database confirmation.
 */
export async function deleteExpense(
  expenseId: string,
  userId: string,
): Promise<{ error: Error | null }> {
  try {
    const { supabase } = await import("./supabase");
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    // Update local cache
    try {
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const key = getExpensesStorageKey(userId);
      const existing = await AsyncStorage.getItem(key);
      if (existing) {
        const list: Expense[] = JSON.parse(existing);
        const filtered = list.filter((e) => e.id !== expenseId);
        await AsyncStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (_e) {}

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
