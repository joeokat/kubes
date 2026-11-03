import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import {
  fetchLatestRiskTolerance,
  evaluateRiskToleranceScore,
} from "../../../lib/risk-tolerance";
import type {
  RiskQuizResponseRecord,
  RiskToleranceEvaluation,
  RiskProfileBand,
} from "../../../types/risk-tolerance";
import { PolicyFooter } from "../../../components/policy-footer";

export default function RiskToleranceScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [record, setRecord] = useState<RiskQuizResponseRecord | null>(null);
  const [evaluation, setEvaluation] = useState<RiskToleranceEvaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const userId = user?.id || "demo-user";

  useEffect(() => {
    let mounted = true;
    fetchLatestRiskTolerance(userId).then((res) => {
      if (mounted) {
        if (res.data) {
          setRecord(res.data);
          const evalResult = evaluateRiskToleranceScore(res.data.answers);
          setEvaluation(evalResult);
        }
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const getBandTheme = (band: RiskProfileBand) => {
    switch (band) {
      case "conservative":
        return {
          label: "Conservative Profile",
          badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          tagBg: "bg-emerald-100 text-emerald-900",
          scoreBg: "bg-emerald-600",
          icon: "🛡️",
        };
      case "moderate":
        return {
          label: "Moderate Profile",
          badgeBg: "bg-blue-50 border-blue-200 text-blue-800",
          tagBg: "bg-blue-100 text-blue-900",
          scoreBg: "bg-blue-600",
          icon: "⚖️",
        };
      case "growth":
        return {
          label: "Growth Profile",
          badgeBg: "bg-purple-50 border-purple-200 text-purple-800",
          tagBg: "bg-purple-100 text-purple-900",
          scoreBg: "bg-purple-600",
          icon: "🚀",
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
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

            <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Phase 2 • Risk Profiling
              </Text>
            </View>
          </View>

          {/* Header Title */}
          <View className="mb-6">
            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Risk Tolerance Profile
            </Text>
            <Text className="text-sm text-slate-600 leading-relaxed">
              Understand your personal capacity and emotional appetite for market fluctuations.
              Knowing your profile helps you design a calm investment journey without the panic
              of selling during market downturns.
            </Text>
          </View>

          {/* Non-Advisory Notice Banner (SOP §7 & §10) */}
          <View className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 mb-6">
            <View className="flex-row items-start gap-2.5">
              <Text className="text-amber-800 font-bold text-sm">💡</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                  Educational Behavioral Profile Only
                </Text>
                <Text className="text-xs text-amber-800/90 leading-relaxed">
                  This assessment evaluates behavioral comfort zones and time horizons. It does
                  not recommend specific stocks, bonds, or funds. All asset allocations shown are
                  universal educational concepts to illustrate risk trade-offs.
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="small" color="#059669" />
              <Text className="text-xs text-slate-500 mt-2">Loading your risk profile...</Text>
            </View>
          ) : !record || !evaluation ? (
            /* First Time State: Take Quiz */
            <View className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm mb-6 text-center">
              <View className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 items-center justify-center mx-auto mb-4">
                <Text className="text-3xl">🎯</Text>
              </View>
              <Text className="text-xl font-extrabold text-slate-900 mb-2 text-center">
                Discover Your Risk Profile
              </Text>
              <Text className="text-xs sm:text-sm text-slate-600 text-center max-w-md mx-auto mb-6 leading-relaxed">
                Take our 5-question calibrated assessment covering time horizon, emotional reactions
                to paper losses, and emergency cushions to reveal your ideal asset mix.
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(app)/risk-tolerance/quiz" as any)}
                activeOpacity={0.85}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                <Text className="text-sm font-bold text-white uppercase tracking-wider">
                  Take the 2-Minute Risk Quiz →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Completed Profile Scorecard */
            <View className="gap-6 mb-6">
              {(() => {
                const theme = getBandTheme(evaluation.profileBand);

                return (
                  <View className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    {/* Badge & Score */}
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-2xl">{theme.icon}</Text>
                        <View className={`px-3 py-1 rounded-full border ${theme.badgeBg}`}>
                          <Text className="text-xs font-bold uppercase tracking-wider">
                            {theme.label}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs font-semibold text-slate-400">Tolerance Score</Text>
                        <Text className="text-lg font-extrabold text-slate-900">
                          {evaluation.score} / {evaluation.maxScore}
                        </Text>
                      </View>
                    </View>

                    {/* Headline */}
                    <Text className="text-xl font-extrabold text-slate-900 mb-2">
                      {evaluation.profileLabel}
                    </Text>
                    <Text className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                      {evaluation.summary}
                    </Text>

                    {/* Conceptual Allocation Bar */}
                    <View className="mb-6">
                      <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Conceptual Asset Class Model
                      </Text>
                      <View className="h-4 rounded-full overflow-hidden flex-row bg-slate-100 mb-3">
                        {evaluation.conceptualAllocations.map((alloc, idx) => (
                          <View
                            key={idx}
                            style={{
                              width: `${alloc.percentage}%`,
                              backgroundColor: alloc.color,
                            }}
                          />
                        ))}
                      </View>

                      {/* Legend */}
                      <View className="gap-2">
                        {evaluation.conceptualAllocations.map((alloc, idx) => (
                          <View
                            key={idx}
                            className="flex-row items-start justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <View className="flex-row items-center gap-2 flex-1 pr-2">
                              <View
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: alloc.color }}
                              />
                              <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-800">
                                  {alloc.label}
                                </Text>
                                <Text className="text-[11px] text-slate-500 leading-tight">
                                  {alloc.description}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-xs font-extrabold text-slate-900">
                              {alloc.percentage}%
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Behavioral Characteristics */}
                    <View className="mb-6 pt-4 border-t border-slate-100">
                      <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Key Behavioral Traits
                      </Text>
                      <View className="gap-2">
                        {evaluation.behavioralCharacteristics.map((trait, idx) => (
                          <View key={idx} className="flex-row items-start gap-2">
                            <Text className="text-xs text-slate-400 mt-0.5">•</Text>
                            <Text className="text-xs text-slate-700 leading-relaxed flex-1">
                              {trait}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Learner Principles */}
                    <View className="mb-6 pt-4 border-t border-slate-100">
                      <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Recommended Habit Principles
                      </Text>
                      <View className="gap-2">
                        {evaluation.learnerPrinciples.map((principle, idx) => (
                          <View
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex-row items-start gap-2"
                          >
                            <Text className="text-xs text-emerald-700 font-bold mt-0.5">✓</Text>
                            <Text className="text-xs text-slate-700 leading-relaxed flex-1">
                              {principle}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Retake CTA */}
                    <TouchableOpacity
                      onPress={() => router.push("/(app)/risk-tolerance/quiz" as any)}
                      activeOpacity={0.8}
                      className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white items-center justify-center"
                    >
                      <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Retake Assessment ↺
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </View>
          )}
        </View>

        {/* Global Policy Footer */}
        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

