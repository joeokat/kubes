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
