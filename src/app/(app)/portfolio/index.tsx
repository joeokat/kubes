import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import {
  ASSET_CLASS_COLORS,
  calculateDiversificationMetrics,
  deletePortfolioHolding,
  fetchPortfolioHoldings,
} from "../../../lib/portfolio";
import type {
  DiversificationMetrics,
  PortfolioHolding,
} from "../../../types/portfolio";
import { PolicyFooter } from "../../../components/policy-footer";

// ---------------------------------------------------------------------------
// Stacked bar component
// ---------------------------------------------------------------------------

function StackedBar({ metrics }: { metrics: DiversificationMetrics }) {
  if (metrics.totalValueGhs === 0) return null;
  return (
    <View className="h-6 flex-row rounded-full overflow-hidden mb-3">
      {metrics.assetClassBreakdown.map((a) => (
        <View
          key={a.assetClass}
          style={{ flex: a.percent, backgroundColor: a.color }}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Diversification badge
// ---------------------------------------------------------------------------

function levelBadgeStyle(level: DiversificationMetrics["diversificationLevel"]) {
  if (level === "Well Diversified") return "bg-emerald-100 text-emerald-800";
  if (level === "Moderate Spread") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PortfolioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [metrics, setMetrics] = useState<DiversificationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setFetchError(null);
    const { data, error } = await fetchPortfolioHoldings(userId);
    if (error) setFetchError(error);
    setHoldings(data);
    setMetrics(calculateDiversificationMetrics(data));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(
    async (h: PortfolioHolding) => {
      if (!userId) return;
      Alert.alert(
        "Remove Holding",
        `Remove "${h.asset_name}" from your portfolio?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              setDeleting(h.id);
              const { success, error } = await deletePortfolioHolding(
                userId,
                h.id
              );
              setDeleting(null);
              if (!success || error) {
                Alert.alert(
                  "Error",
                  error ?? "Could not remove holding. Please try again."
                );
              } else {
                await load();
              }
            },
          },
        ]
      );
    },
    [userId, load]
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-2 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.replace("/(app)/dashboard" as any)}
            className="mr-2"
          >
            <Text className="text-slate-500 text-sm">← Dashboard</Text>
          </TouchableOpacity>
          <View className="bg-indigo-100 rounded-full px-3 py-1 ml-auto">
            <Text className="text-indigo-700 text-xs font-semibold">
              Phase 2 · Insights
            </Text>
          </View>
        </View>

        <View className="px-6 pb-2">
          <Text className="text-2xl font-bold text-slate-900">
            📊 Portfolio Insights
          </Text>
          <Text className="text-slate-500 text-sm mt-1">
            Self-reported holdings · educational framing only
          </Text>
        </View>

        {/* Non-advisory notice */}
        <View className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <Text className="text-blue-800 text-xs leading-relaxed">
            ℹ️ This tool shows how your self-reported holdings are distributed
            across asset classes. It is for educational purposes only and does
            not constitute financial advice, a recommendation to buy or sell any
            asset, or a guarantee of any outcome.
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View className="flex-1 items-center justify-center py-16">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-slate-500 mt-3 text-sm">
              Loading portfolio…
            </Text>
          </View>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <View className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <Text className="text-red-700 text-sm">
              ⚠️ {fetchError}
            </Text>
            <TouchableOpacity onPress={load} className="mt-2">
              <Text className="text-red-600 font-semibold text-sm underline">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {!loading && holdings.length === 0 && (
          <View className="mx-6 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm items-center">
            <Text className="text-4xl mb-4">📁</Text>
            <Text className="text-slate-800 font-bold text-lg text-center mb-2">
              No holdings yet
            </Text>
            <Text className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
              Add your self-reported holdings to see how they are distributed
              across asset classes.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/portfolio/add" as any)}
              className="bg-indigo-600 rounded-2xl px-6 py-3"
            >
              <Text className="text-white font-semibold text-sm">
                + Add First Holding
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Portfolio overview */}
        {!loading && metrics && holdings.length > 0 && (
          <>
            {/* Summary card */}
            <View className="mx-6 mb-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-slate-500 text-xs uppercase tracking-wider">
                  Total (self-reported)
                </Text>
                <View
                  className={`rounded-full px-3 py-1 ${levelBadgeStyle(
                    metrics.diversificationLevel
                  )}`}
                >
                  <Text className="text-xs font-semibold">
                    {metrics.diversificationLevel}
                  </Text>
                </View>
              </View>
              <Text className="text-3xl font-bold text-slate-900 mb-4">
                GHS {metrics.totalValueGhs.toLocaleString()}
              </Text>

              {/* Stacked bar */}
              <StackedBar metrics={metrics} />

              {/* Score */}
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-slate-500 text-xs">
                  Diversification score
                </Text>
                <Text className="text-slate-800 font-bold text-sm">
                  {metrics.diversificationScore} / 100
                </Text>
              </View>
              <View className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <View
                  className="h-2 bg-indigo-500 rounded-full"
                  style={{ width: `${metrics.diversificationScore}%` }}
                />
              </View>
            </View>

            {/* Asset class breakdown */}
            <View className="mx-6 mb-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Text className="text-slate-800 font-bold text-base mb-4">
                Asset Class Breakdown
              </Text>
              {metrics.assetClassBreakdown.map((a) => (
                <View
                  key={a.assetClass}
                  className="flex-row items-center mb-3"
                >
                  <View
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: ASSET_CLASS_COLORS[a.assetClass] }}
                  />
                  <Text className="flex-1 text-slate-700 text-sm">
                    {a.label}
                  </Text>
                  <Text className="text-slate-500 text-xs mr-3">
                    {a.count} holding{a.count !== 1 ? "s" : ""}
                  </Text>
                  <Text className="text-slate-800 font-semibold text-sm w-16 text-right">
                    {a.percent.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Concentration warnings */}
            {metrics.concentrationWarnings.length > 0 && (
              <View className="mx-6 mb-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                <Text className="text-amber-800 font-semibold text-sm mb-2">
                  ⚠️ Concentration Notice
                </Text>
                {metrics.concentrationWarnings.map((w, i) => (
                  <Text
                    key={i}
                    className="text-amber-700 text-xs leading-relaxed mb-1"
                  >
                    • {w}
                  </Text>
                ))}
              </View>
            )}

            {/* Educational observations */}
            <View className="mx-6 mb-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Text className="text-slate-800 font-bold text-base mb-3">
                📚 Educational Notes
              </Text>
              {metrics.educationalObservations.map((obs, i) => (
                <Text
                  key={i}
                  className="text-slate-600 text-sm leading-relaxed mb-2"
                >
                  • {obs}
                </Text>
              ))}
            </View>

            {/* Holdings list */}
            <View className="mx-6 mb-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Text className="text-slate-800 font-bold text-base mb-4">
                Holdings ({metrics.holdingsCount})
              </Text>
              {holdings.map((h) => (
                <View
                  key={h.id}
                  className="flex-row items-center py-3 border-b border-slate-50"
                >
                  <View
                    className="w-2 h-8 rounded-full mr-3"
                    style={{
                      backgroundColor: ASSET_CLASS_COLORS[h.asset_class],
                    }}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-slate-800 font-semibold text-sm"
                      numberOfLines={1}
                    >
                      {h.asset_name}
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      {h.asset_class.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <Text className="text-slate-700 font-bold text-sm mr-3">
                    GHS {h.amount_ghs.toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(h)}
                    disabled={deleting === h.id}
                    className="p-2"
                  >
                    {deleting === h.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Text className="text-red-400 text-base">✕</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add holding CTA */}
            <View className="mx-6 mb-6">
              <TouchableOpacity
                onPress={() => router.push("/(app)/portfolio/add" as any)}
                className="bg-indigo-600 rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-bold text-sm">
                  + Add Holding
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

