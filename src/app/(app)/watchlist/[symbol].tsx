import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import {
  getAssetBySymbol,
  formatAssetPrice,
  formatAssetChange,
  isSymbolInWatchlist,
  fetchUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../../../lib/watchlist";
import type { AssetType, WatchlistItem } from "../../../types/watchlist";
import { PolicyFooter } from "../../../components/policy-footer";

export default function AssetDetailScreen() {
  const router = useRouter();
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { user } = useAuth();

  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const userId = user?.id || "demo-user";
  const asset = symbol ? getAssetBySymbol(symbol) : null;

  useEffect(() => {
    let mounted = true;
    fetchUserWatchlist(userId).then((res) => {
      if (mounted) {
        setWatchlistItems(res.data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  if (!asset) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FB] items-center justify-center p-6">
        <Text className="text-xl font-bold text-slate-800 mb-2">Asset Not Found</Text>
        <Text className="text-sm text-slate-500 mb-4 text-center">
          The requested market symbol was not found in the curated educational universe.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(app)/watchlist" as any)}
          className="py-2.5 px-4 rounded-xl bg-emerald-600"
        >
          <Text className="text-xs font-bold text-white">← Return to Watchlist</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isTracked = isSymbolInWatchlist(watchlistItems, asset.symbol);
  const change = formatAssetChange(asset.change24h, asset.changePercent24h);

  const handleToggleTrack = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (isTracked) {
      const res = await removeFromWatchlist(userId, asset.symbol);
      if (res.success) {
        setWatchlistItems((prev) =>
          prev.filter((i) => i.symbol.toUpperCase() !== asset.symbol.toUpperCase()),
        );
      }
    } else {
      const res = await addToWatchlist(userId, asset.symbol, asset.assetType);
      if (res.data) {
        setWatchlistItems((prev) => [res.data!, ...prev]);
      }
    }

    setSubmitting(false);
  };

  const getAssetBadge = (type: AssetType) => {
    switch (type) {
      case "gh_stock":
        return { label: "Ghana Stock Exchange (GSE)", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "us_stock":
        return { label: "US Markets & Indices", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "commodity":
        return { label: "Global Commodity", bg: "bg-amber-50 text-amber-800 border-amber-200" };
    }
  };

  const badge = getAssetBadge(asset.assetType);

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
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">← Watchlist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleTrack}
              disabled={submitting}
              activeOpacity={0.8}
              className={`py-2 px-4 rounded-xl flex-row items-center gap-1.5 ${
                isTracked
                  ? "bg-slate-100 border border-slate-200"
                  : "bg-emerald-600 active:bg-emerald-700"
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={isTracked ? "#334155" : "#ffffff"} />
              ) : (
                <Text
                  className={`text-xs font-bold ${
                    isTracked ? "text-slate-700" : "text-white"
                  }`}
                >
                  {isTracked ? "✓ Tracked in Watchlist" : "+ Add to Watchlist"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Hero Header Card */}
          <View className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <View className={`px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                <Text className="text-[10px] font-bold uppercase tracking-wider">
                  {badge.label}
                </Text>
              </View>
              <Text className="text-xs font-semibold text-slate-400">
                {asset.market}
              </Text>
            </View>

            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {asset.name}
            </Text>
            <Text className="text-sm font-bold text-emerald-800 mt-0.5 mb-4">
              Ticker: {asset.symbol} • {asset.sector}
            </Text>

            <View className="flex-row items-baseline gap-3 pt-4 border-t border-slate-100">
              <Text className="text-3xl font-extrabold text-slate-900">
                {formatAssetPrice(asset.price, asset.currency)}
              </Text>
              <View
                className={`px-2.5 py-1 rounded-xl ${
                  change.isNeutral
                    ? "bg-slate-100"
                    : change.isPositive
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-rose-50 border border-rose-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    change.isNeutral
                      ? "text-slate-600"
                      : change.isPositive
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {change.text}
                </Text>
              </View>
            </View>
          </View>

          {/* Educational Profile */}
          <View className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm mb-6">
            <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              📖 Educational Overview
            </Text>
            <Text className="text-sm text-slate-700 leading-relaxed mb-4">
              {asset.educationalNotes}
            </Text>
          </View>

          {/* Key Educational Metrics */}
          <View className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm mb-6">
            <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              📊 Market Characteristics
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between py-2 border-b border-slate-100">
                <Text className="text-xs font-medium text-slate-500">Market Size / Capitalization</Text>
                <Text className="text-xs font-bold text-slate-800">
                  {asset.metrics.marketCapOrSize || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-slate-100">
                <Text className="text-xs font-medium text-slate-500">52-Week Price Range</Text>
                <Text className="text-xs font-bold text-slate-800">
                  {asset.metrics.range52w || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-slate-100">
                <Text className="text-xs font-medium text-slate-500">Dividend / Yield Profile</Text>
                <Text className="text-xs font-bold text-slate-800 max-w-[200px] text-right">
                  {asset.metrics.dividendYieldOrNote || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-xs font-medium text-slate-500">Primary Trading Hours</Text>
                <Text className="text-xs font-bold text-slate-800">
                  {asset.metrics.tradingHours || "Standard Market Hours"}
                </Text>
              </View>
            </View>
          </View>

          {/* Risk Factors Box */}
          <View className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                ⚠️ Key Risk Factors to Study
              </Text>
            </View>
            <Text className="text-xs text-slate-500 mb-3 leading-relaxed">
              Every investment involves real capital risk. Before considering any asset class in the future, learners should understand these primary risk drivers:
            </Text>
            <View className="gap-2.5">
              {asset.riskFactors.map((risk, index) => (
                <View key={index} className="flex-row items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Text className="text-xs font-bold text-slate-400 mt-0.5">•</Text>
                  <Text className="text-xs text-slate-700 leading-relaxed flex-1">
                    {risk}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Compliance Disclaimer (SOP §7) */}
          <View className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 mb-6">
            <Text className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
              Important Educational Notice
            </Text>
            <Text className="text-xs text-amber-800/90 leading-relaxed">
              This overview is compiled for general investment literacy and educational demonstration only. Nothing on this page constitutes financial advice, tax guidance, or a buy/sell solicitation. Past performance is not indicative of future returns.
            </Text>
          </View>
        </View>

        {/* Global Policy Footer */}
        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

