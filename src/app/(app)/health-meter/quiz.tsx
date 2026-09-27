import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import {
  calculateHealthScore,
  saveHealthQuizResponse,
  INCOME_RANGE_OPTIONS,
  INCOME_STABILITY_OPTIONS,
} from "../../../lib/health-meter";
import { IncomeStability } from "../../../types/health-meter";

const ESSENTIALS_OPTIONS = [
  { percent: 45, label: "45% or less", subtitle: "Comfortable margin; low fixed costs" },
  { percent: 55, label: "55% (Balanced)", subtitle: "Aligned with the 55/5/10/15/15 model" },
  { percent: 65, label: "65%", subtitle: "Moderate; some room for savings" },
  { percent: 75, label: "75%", subtitle: "Tight; fixed costs dominate cash flow" },
  { percent: 85, label: "85%+", subtitle: "High fixed overhead; very little margin" },
];

const SAVINGS_OPTIONS = [
  { rate: 0, label: "0% (None yet)", subtitle: "Living paycheck to paycheck" },
  { rate: 5, label: "5%", subtitle: "Starting a monthly saving habit" },
  { rate: 10, label: "10%", subtitle: "Consistent baseline accumulation" },
  { rate: 15, label: "15%", subtitle: "Healthy savings and investing cushion" },
  { rate: 20, label: "20%+", subtitle: "Strong compounding momentum" },
];

const EMERGENCY_OPTIONS = [
  { months: 0, label: "0 Months", subtitle: "No cash reserve currently" },
  { months: 0.5, label: "Under 1 Month", subtitle: "Less than 30 days of expenses" },
  { months: 2, label: "1 to 2 Months", subtitle: "Starter emergency buffer" },
  { months: 4, label: "3 to 5 Months", subtitle: "Solid financial resilience" },
  { months: 6, label: "6+ Months", subtitle: "Maximum safety cushion" },
];

export default function HealthQuizScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [incomeRange, setIncomeRange] = useState<string>("tier_2");
  const [incomeStability, setIncomeStability] = useState<IncomeStability>("stable");
  const [essentialsPercent, setEssentialsPercent] = useState<number>(55);
  const [savingsRate, setSavingsRate] = useState<number>(10);
  const [emergencyMonths, setEmergencyMonths] = useState<number>(2);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live calculation preview
  const currentEvaluation = calculateHealthScore({
    incomeRange,
    incomeStability,
    spendBuckets: {
      essentialsPercent,
      discretionaryPercent: Math.max(0, 100 - essentialsPercent - savingsRate),
      debtOrOtherPercent: 0,
    },
    savingsRate,
    emergencyMonths,
  });

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const input = {
      incomeRange,
      incomeStability,
      spendBuckets: {
        essentialsPercent,
        discretionaryPercent: Math.max(0, 100 - essentialsPercent - savingsRate),
        debtOrOtherPercent: 0,
      },
      savingsRate,
      emergencyMonths,
    };

    const result = calculateHealthScore(input);
    const { error } = await saveHealthQuizResponse(user.id, input, result);

    if (error) {
      setErrorMessage("Could not record assessment to database. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.replace("/(app)/health-meter" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Bar Navigation */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => {
                if (step > 1) {
                  setStep((s) => s - 1);
                } else {
                  router.replace("/(app)/health-meter" as any);
                }
              }}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">
                {step > 1 ? "← Back" : "← Cancel"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center space-x-2">
              <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
                <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Step {step} of 4
                </Text>
              </View>
            </View>
          </View>

          {/* Step Progress Bar */}
          <View className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-6">
            <View
              style={{ width: `${(step / 4) * 100}%` }}
              className="h-full bg-emerald-600 rounded-full"
            />
          </View>

          {/* Step 1: Income Range & Stability */}
          {step === 1 && (
            <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
              <Text className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Income & Predictability
              </Text>
              <Text className="text-sm text-slate-500 mb-6">
                Tell us about your earnings level and how consistent your payouts are.
              </Text>

              {/* Income Tier */}
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Earnings Range
              </Text>
              <View className="space-y-2 mb-6">
                {INCOME_RANGE_OPTIONS.map((opt) => {
                  const isSelected = incomeRange === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setIncomeRange(opt.id)}
                      activeOpacity={0.8}
                      className={`p-4 rounded-2xl border transition-all mb-2 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text
                            className={`text-sm font-bold ${
                              isSelected ? "text-emerald-900" : "text-slate-900"
                            }`}
                          >
                            {opt.label}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {opt.subtitle}
                          </Text>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <Text className="text-white text-[10px] font-bold">✓</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Income Stability */}
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cash Flow Stability
              </Text>
              <View className="space-y-2 mb-6">
                {INCOME_STABILITY_OPTIONS.map((opt) => {
                  const isSelected = incomeStability === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setIncomeStability(opt.id)}
                      activeOpacity={0.8}
                      className={`p-4 rounded-2xl border transition-all mb-2 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text
                            className={`text-sm font-bold ${
                              isSelected ? "text-emerald-900" : "text-slate-900"
                            }`}
                          >
                            {opt.label}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {opt.desc}
                          </Text>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <Text className="text-white text-[10px] font-bold">✓</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => setStep(2)}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                <Text className="text-sm font-bold text-white uppercase tracking-wider">
                  Next: Essential Expenses →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Essential Expenses Ratio */}
          {step === 2 && (
            <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
              <Text className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Essential Living Expenses
              </Text>
              <Text className="text-sm text-slate-500 mb-6">
                What percentage of your income goes toward non-negotiables (housing, groceries, utilities, basic transport)?
              </Text>

              <View className="space-y-2 mb-6">
                {ESSENTIALS_OPTIONS.map((opt) => {
                  const isSelected = essentialsPercent === opt.percent;
                  return (
                    <TouchableOpacity
                      key={opt.percent}
                      onPress={() => setEssentialsPercent(opt.percent)}
                      activeOpacity={0.8}
                      className={`p-4 rounded-2xl border transition-all mb-2.5 ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text
                            className={`text-sm font-bold ${
                              isSelected ? "text-purple-900" : "text-slate-900"
                            }`}
                          >
                            {opt.label}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {opt.subtitle}
                          </Text>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-purple-600 bg-purple-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <Text className="text-white text-[10px] font-bold">✓</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => setStep(3)}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                <Text className="text-sm font-bold text-white uppercase tracking-wider">
                  Next: Monthly Savings Rate →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Savings Rate */}
          {step === 3 && (
            <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
              <Text className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Monthly Savings Rate
              </Text>
              <Text className="text-sm text-slate-500 mb-6">
                What percentage of your earnings do you reliably set aside for savings or investing?
              </Text>

              <View className="space-y-2 mb-6">
                {SAVINGS_OPTIONS.map((opt) => {
                  const isSelected = savingsRate === opt.rate;
                  return (
                    <TouchableOpacity
                      key={opt.rate}
                      onPress={() => setSavingsRate(opt.rate)}
                      activeOpacity={0.8}
                      className={`p-4 rounded-2xl border transition-all mb-2.5 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text
                            className={`text-sm font-bold ${
                              isSelected ? "text-emerald-900" : "text-slate-900"
                            }`}
                          >
                            {opt.label}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {opt.subtitle}
                          </Text>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <Text className="text-white text-[10px] font-bold">✓</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => setStep(4)}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                <Text className="text-sm font-bold text-white uppercase tracking-wider">
                  Next: Emergency Runway →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 4: Emergency Fund Runway & Live Preview */}
          {step === 4 && (
            <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
              <Text className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Emergency Runway
              </Text>
              <Text className="text-sm text-slate-500 mb-6">
                If all income stopped today, how many months of basic survival expenses could you fund?
              </Text>

              <View className="space-y-2 mb-6">
                {EMERGENCY_OPTIONS.map((opt) => {
                  const isSelected = emergencyMonths === opt.months;
                  return (
                    <TouchableOpacity
                      key={opt.months}
                      onPress={() => setEmergencyMonths(opt.months)}
                      activeOpacity={0.8}
                      className={`p-4 rounded-2xl border transition-all mb-2.5 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text
                            className={`text-sm font-bold ${
                              isSelected ? "text-blue-900" : "text-slate-900"
                            }`}
                          >
                            {opt.label}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {opt.subtitle}
                          </Text>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <Text className="text-white text-[10px] font-bold">✓</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Live Preview Card */}
              <View className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Calculated Score Preview
                  </Text>
                  <View className="px-2.5 py-0.5 rounded-full bg-emerald-100">
                    <Text className="text-xs font-bold text-emerald-800">
                      {currentEvaluation.band} Band
                    </Text>
                  </View>
                </View>
                <Text className="text-2xl font-extrabold text-slate-900 mb-1">
                  {currentEvaluation.score} / 100
                </Text>
                <Text className="text-xs text-slate-500">
                  {currentEvaluation.summary}
                </Text>
              </View>

              {errorMessage && (
                <View className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <Text className="text-xs text-red-700">{errorMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white uppercase tracking-wider">
                    Save My Financial Health Score →
                  </Text>
                )}
              </TouchableOpacity>
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
