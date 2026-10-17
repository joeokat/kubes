import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/auth";
import {
  computeBudgetSummaries,
  deleteExpense,
  fetchActiveFramework,
  fetchExpenses,
  generateBudgetRecommendations,
  generateBudgetWarnings,
} from "../../../lib/budget";
import {
  BudgetFramework,
  BudgetWarning,
  CategorySpendSummary,
  Expense,
} from "../../../types/budget";
import { PolicyFooter } from "../../../components/policy-footer";

export default function BudgetOverviewScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [framework, setFramework] = useState<BudgetFramework | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const currentMonthDisplay = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const fw = await fetchActiveFramework(user.id);
    const exList = await fetchExpenses(user.id, currentMonthStr);
    setFramework(fw);
    setExpenses(exList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const monthlyIncome = framework?.monthly_income || 3000;
  const summaries: CategorySpendSummary[] = framework
    ? computeBudgetSummaries(framework, monthlyIncome, expenses)
    : [];
  const warnings: BudgetWarning[] = framework
    ? generateBudgetWarnings(framework, monthlyIncome, expenses)
    : [];
  const recommendations: string[] = framework
    ? generateBudgetRecommendations(framework, monthlyIncome, expenses)
    : [];

  const totalSpent = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );
  const totalPercentageUsed =
    monthlyIncome > 0 ? Math.round((totalSpent / monthlyIncome) * 100) : 0;
  const netRemaining = Number((monthlyIncome - totalSpent).toFixed(2));

  const handleDeleteExpense = (expenseId?: string) => {
    if (!expenseId || !user) return;

    const executeDelete = async () => {
      setDeletingId(expenseId);
      const { error } = await deleteExpense(expenseId, user.id);
      if (error) {
        alert("Failed to delete expense: " + error.message);
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      }
      setDeletingId(null);
    };

    if (typeof window !== "undefined" && (window as any).confirm) {
      if ((window as any).confirm("Delete this expense entry?")) {
        executeDelete();
      }
    } else {
      Alert.alert(
        "Delete Expense",
        "Are you sure you want to remove this expense entry?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: executeDelete },
        ],
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Bar Navigation */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => router.replace("/(app)/dashboard" as any)}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">
                ← Dashboard
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center space-x-2">
              <TouchableOpacity
                onPress={() => router.push("/(app)/budget/framework" as any)}
                activeOpacity={0.75}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-white mr-2"
              >
                <Text className="text-xs font-bold text-slate-700">
                  ⚙️ Framework
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(app)/budget/log" as any)}
                activeOpacity={0.85}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 shadow-xs"
              >
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  + Log Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-sm text-slate-500 mt-4">
                Loading your budget and expenses...
              </Text>
            </View>
          ) : (
            <View>
              {/* Monthly Overview Card */}
              <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                <View className="flex-row flex-wrap items-center justify-between gap-2 mb-2">
                  <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
                    <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {currentMonthDisplay}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-500 font-medium">
                    {framework?.name || "Active Framework"}
                  </Text>
                </View>

                <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                  Budget & Spending
                </Text>
                <Text className="text-sm text-slate-500 mb-6">
                  Track cash flow against your chosen percentage allocations in
                  real-time.
                </Text>

                {/* Aurex/Finor 3-stat metric bar */}
                <View className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <View>
                    <Text className="text-xs font-semibold text-slate-500 uppercase">
                      Declared Income
                    </Text>
                    <Text className="text-xl font-bold text-slate-900">
                      ${monthlyIncome.toLocaleString()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-slate-500 uppercase">
                      Total Spent
                    </Text>
                    <Text
                      className={`text-xl font-bold ${
                        totalSpent > monthlyIncome
                          ? "text-red-600"
                          : "text-slate-900"
                      }`}
                    >
                      ${totalSpent.toLocaleString()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-slate-500 uppercase">
                      {netRemaining >= 0 ? "Remaining Buffer" : "Over Budget"}
                    </Text>
                    <Text
                      className={`text-xl font-bold ${
                        netRemaining >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      ${Math.abs(netRemaining).toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Finor multi-segment color distribution preview bar */}
                <View className="mb-2">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Framework Distribution
                    </Text>
                    <Text className="text-xs font-bold text-slate-600">
                      {totalPercentageUsed}% Income Used
                    </Text>
                  </View>

                  <View className="flex-row h-3 rounded-full overflow-hidden bg-slate-200">
                    {framework?.categories.map((cat) => (
                      <View
                        key={cat.id}
                        style={{
                          width: `${cat.percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    ))}
                  </View>

                  {/* Legend */}
                  <View className="flex-row flex-wrap gap-3 mt-3">
                    {framework?.categories.map((cat) => (
                      <View
                        key={cat.id}
                        className="flex-row items-center space-x-1.5 mr-2"
                      >
                        <View
                          style={{ backgroundColor: cat.color }}
                          className="w-2.5 h-2.5 rounded-full mr-1.5"
                        />
                        <Text className="text-xs text-slate-600 font-medium">
                          {cat.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Overspend Warnings Banner (if any category exceeded allocation) */}
              {warnings.length > 0 && (
                <View className="bg-amber-50 border border-amber-300 rounded-3xl p-5 mb-6">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-base mr-2">⚠️</Text>
                    <Text className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                      Category Overspend Alert
                    </Text>
                  </View>
                  <View className="space-y-1 mb-3">
                    {warnings.map((w, idx) => (
                      <Text
                        key={idx}
                        className="text-xs text-amber-800 leading-normal"
                      >
                        • <Text className="font-bold">{w.categoryLabel}</Text>{" "}
                        is over plan by ${w.overspendAmount} (
                        {w.overspendPercentage}% above allocation).
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* Recommendations Card */}
              {recommendations.length > 0 && (
                <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-slate-900">
                      Budget Insights
                    </Text>
                    <View className="px-2.5 py-0.5 bg-slate-100 rounded-full">
                      <Text className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Arithmetic
                      </Text>
                    </View>
                  </View>

                  <View className="space-y-2">
                    {recommendations.map((rec, idx) => (
                      <View
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-2"
                      >
                        <Text className="text-xs text-slate-700 leading-relaxed">
                          💡 {rec}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Category Spending Gauges */}
              <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-900 mb-4">
                  Category Allocation Gauges
                </Text>

                <View className="space-y-4">
                  {summaries.map((s) => {
                    const statusColor =
                      s.status === "over"
                        ? "bg-red-500"
                        : s.status === "near"
                          ? "bg-amber-500"
                          : "bg-emerald-600";

                    const badgeStyle =
                      s.status === "over"
                        ? "bg-red-100 text-red-800"
                        : s.status === "near"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800";

                    return (
                      <View
                        key={s.category.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center space-x-2">
                            <Text className="text-base mr-2">
                              {s.category.icon}
                            </Text>
                            <View>
                              <Text className="text-xs font-bold text-slate-800">
                                {s.category.label}
                              </Text>
                              <Text className="text-[10px] text-slate-500">
                                Target: ${s.budgetAmount} ({s.category.percent}
                                %)
                              </Text>
                            </View>
                          </View>

                          <View className="items-end">
                            <View
                              className={`px-2 py-0.5 rounded-full ${badgeStyle} mb-1`}
                            >
                              <Text className="text-[10px] font-bold uppercase tracking-wider">
                                {s.status}
                              </Text>
                            </View>
                            <Text className="text-xs font-bold text-slate-800">
                              ${s.spentAmount} spent ({s.percentageUsed}%)
                            </Text>
                          </View>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <View
                            style={{
                              width: `${Math.min(100, s.percentageUsed)}%`,
                            }}
                            className={`h-full rounded-full ${statusColor}`}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Recent Logged Expenses */}
              <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-slate-900">
                    Logged Expenses ({expenses.length})
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(app)/budget/log" as any)}
                    activeOpacity={0.7}
                    className="py-1 px-3 rounded-lg bg-emerald-50 border border-emerald-200"
                  >
                    <Text className="text-xs font-bold text-emerald-800">
                      + Add
                    </Text>
                  </TouchableOpacity>
                </View>

                {expenses.length === 0 ? (
                  <View className="py-8 items-center justify-center">
                    <Text className="text-sm text-slate-400 mb-2">
                      No expenses logged yet this month.
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/(app)/budget/log" as any)}
                      className="py-2 px-4 rounded-xl bg-emerald-600"
                    >
                      <Text className="text-xs font-bold text-white uppercase">
                        Log First Expense
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="space-y-2">
                    {expenses.map((exp) => (
                      <View
                        key={exp.id || Math.random().toString()}
                        className="flex-row items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white mb-2"
                      >
                        <View className="flex-1 pr-3">
                          <Text className="text-sm font-bold text-slate-900">
                            {exp.category_label}
                          </Text>
                          {exp.note ? (
                            <Text className="text-xs text-slate-500 mt-0.5">
                              {exp.note}
                            </Text>
                          ) : null}
                          <Text className="text-[10px] text-slate-400 mt-1">
                            {exp.spent_at}
                          </Text>
                        </View>

                        <View className="flex-row items-center space-x-3">
                          <Text className="text-sm font-extrabold text-slate-900 mr-3">
                            ${Number(exp.amount).toFixed(2)}
                          </Text>

                          {exp.id ? (
                            <TouchableOpacity
                              onPress={() => handleDeleteExpense(exp.id)}
                              disabled={deletingId === exp.id}
                              activeOpacity={0.7}
                              className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
                            >
                              {deletingId === exp.id ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#94A3B8"
                                />
                              ) : (
                                <Text className="text-xs text-slate-500 font-bold">
                                  ✕
                                </Text>
                              )}
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Compliance Disclaimer Footer per SOP §7 */}
        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
