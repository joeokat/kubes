import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import { fetchLatestHealthScore, calculateHealthScore } from "../../../lib/health-meter";
import { HealthQuizRecord, HealthScoreResult } from "../../../types/health-meter";

export default function HealthMeterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [record, setRecord] = useState<HealthQuizRecord | null>(null);
  const [scoreResult, setScoreResult] = useState<HealthScoreResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchLatestHealthScore(user.id).then((data) => {
        if (data) {
          setRecord(data);
          const computed = calculateHealthScore({
            incomeRange: data.income_range,
            incomeStability: "stable",
            spendBuckets: data.spend_buckets,
            savingsRate: Number(data.savings_rate),
            emergencyMonths: Number(data.emergency_months),
          });
          setScoreResult(computed);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const getBandStyles = (band?: string) => {
    switch (band) {
      case "Strong":
        return {
          textColor: "text-emerald-800",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-300",
          ringColor: "border-emerald-500",
          badgeBg: "bg-emerald-100",
          accentColor: "#10B981",
        };
      case "Steady":
        return {
          textColor: "text-blue-800",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-300",
          ringColor: "border-blue-500",
          badgeBg: "bg-blue-100",
          accentColor: "#3B82F6",
        };
      default:
        return {
          textColor: "text-amber-800",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-300",
          ringColor: "border-amber-500",
          badgeBg: "bg-amber-100",
          accentColor: "#F59E0B",
        };
    }
  };

  const bandStyles = getBandStyles(record?.band);

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
              <Text className="text-xs font-bold text-slate-700">← Dashboard</Text>
            </TouchableOpacity>

            <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
              <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Financial Health
              </Text>
            </View>
          </View>

          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-sm text-slate-500 mt-4">Loading your financial scorecard...</Text>
            </View>
          ) : !record ? (
            /* Unassessed State Card */
            <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
              <View className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 items-center justify-center mb-4">
                <Text className="text-emerald-700 font-bold text-xl">🩺</Text>
              </View>

              <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Assess Your Financial Health
              </Text>
              <Text className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6">
                Understand where your money goes, calculate your emergency runway, and receive a plain-language score band with personalized educational steps.
              </Text>

              {/* Assessment Breakdown Preview Grid */}
              <View className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    1. Emergency Runway
                  </Text>
                  <Text className="text-xs text-slate-500">
                    How many months of basic living costs your cash reserves cover.
                  </Text>
                </View>

                <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    2. Monthly Savings Rate
                  </Text>
                  <Text className="text-xs text-slate-500">
                    The percentage of income routinely saved or invested.
                  </Text>
                </View>

                <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    3. Essentials Ratio
                  </Text>
                  <Text className="text-xs text-slate-500">
                    How closely fixed needs mirror healthy budgeting guidelines.
                  </Text>
                </View>

                <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    4. Cash Flow Predictability
                  </Text>
                  <Text className="text-xs text-slate-500">
                    Income stability and buffer against earnings shocks.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(app)/health-meter/quiz" as any)}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                <Text className="text-sm font-bold text-white uppercase tracking-wider">
                  Take 2-Minute Assessment →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Assessed Scorecard View */
            <View>
              {/* Scorecard Hero Banner */}
              <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                <View className="flex-row flex-wrap items-center justify-between gap-4 mb-6">
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-2 mb-2">
                      <View className={`px-3 py-1 rounded-full ${bandStyles.badgeBg} mr-2`}>
                        <Text className={`text-xs font-bold uppercase tracking-wider ${bandStyles.textColor}`}>
                          {record.band} Band
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-400">
                        Updated {new Date(record.computed_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                      Financial Health Score
                    </Text>
                    <Text className="text-sm text-slate-500 leading-relaxed">
                      {scoreResult?.summary}
                    </Text>
                  </View>

                  {/* Aurex/Finor Circular Radial Score Ring */}
                  <View className="items-center justify-center p-3">
                    <View className={`w-24 h-24 rounded-full border-8 bg-slate-50 items-center justify-center ${bandStyles.ringColor}`}>
                      <Text className="text-3xl font-extrabold text-slate-900">
                        {record.score}
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        / 100
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Retake CTA bar */}
                <View className="pt-4 border-t border-slate-100 flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500">
                    Has your income or savings changed?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(app)/health-meter/quiz" as any)}
                    activeOpacity={0.7}
                    className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white"
                  >
                    <Text className="text-xs font-bold text-slate-700">Retake Quiz ↻</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dimension Breakdown Metrics */}
              <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-900 mb-4">
                  Assessment Breakdown
                </Text>

                <View className="space-y-4">
                  {/* Metric 1: Savings Rate */}
                  <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Monthly Savings Rate
                      </Text>
                      <Text className="text-xs font-bold text-emerald-700">
                        {record.savings_rate}% of income
                      </Text>
                    </View>
                    <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <View
                        style={{ width: `${Math.min(100, (Number(record.savings_rate) / 20) * 100)}%` }}
                        className="h-full bg-emerald-600 rounded-full"
                      />
                    </View>
                  </View>

                  {/* Metric 2: Emergency Runway */}
                  <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Emergency Fund Runway
                      </Text>
                      <Text className="text-xs font-bold text-blue-700">
                        {record.emergency_months} {Number(record.emergency_months) === 1 ? "month" : "months"}
                      </Text>
                    </View>
                    <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <View
                        style={{ width: `${Math.min(100, (Number(record.emergency_months) / 6) * 100)}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </View>
                  </View>

                  {/* Metric 3: Essentials Ratio */}
                  <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Essential Living Expenses
                      </Text>
                      <Text className="text-xs font-bold text-purple-700">
                        {record.spend_buckets?.essentialsPercent ?? 55}% of income
                      </Text>
                    </View>
                    <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <View
                        style={{ width: `${Math.min(100, record.spend_buckets?.essentialsPercent ?? 55)}%` }}
                        className="h-full bg-purple-600 rounded-full"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Plain-Language Educational Insights (Non-advisory per SOP §7) */}
              {scoreResult && scoreResult.tips.length > 0 && (
                <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold text-slate-900">
                      Educational Takeaways
                    </Text>
                    <View className="px-2.5 py-0.5 bg-slate-100 rounded-full">
                      <Text className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        Next Steps
                      </Text>
                    </View>
                  </View>

                  <View className="space-y-3">
                    {scoreResult.tips.map((tip, idx) => (
                      <View
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-2.5"
                      >
                        <Text className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          💡 Insight {idx + 1}
                        </Text>
                        <Text className="text-sm text-slate-600 leading-relaxed">
                          {tip}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Compliance Disclaimer Footer per SOP §7 */}
        <View className="pt-6 pb-2 border-t border-slate-200/70">
          <Text className="text-xs text-slate-500 text-center leading-relaxed">
            This platform is for education only. Nothing here is financial, investment, or trading advice, and no outcome is promised. Kubes is not a registered investment advisor or broker-dealer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
