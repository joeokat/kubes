import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import {
  CURATED_MARKET_ASSETS,
  searchAssets,
  formatAssetPrice,
  formatAssetChange,
  isSymbolInWatchlist,
  fetchUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../../../lib/watchlist";
import type { AssetType, MarketAsset, WatchlistItem } from "../../../types/watchlist";
import { PolicyFooter } from "../../../components/policy-footer";

const CATEGORY_TABS: { label: string; value: AssetType | "all" }[] = [
  { label: "All Assets", value: "all" },
  { label: "Ghana (GSE)", value: "gh_stock" },
  { label: "US Markets", value: "us_stock" },
  { label: "Commodities", value: "commodity" },
];

export default function WatchlistScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<AssetType | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const userId = user?.id || "demo-user";

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

  const handleToggleWatchlist = async (asset: MarketAsset) => {
    if (actionInProgress) return;
    setActionInProgress(asset.symbol);

    const isCurrentlyTracked = isSymbolInWatchlist(watchlistItems, asset.symbol);

    if (isCurrentlyTracked) {
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

    setActionInProgress(null);
  };

  const displayedAssets = useMemo(() => {
    return searchAssets(searchQuery, activeTab);
  }, [searchQuery, activeTab]);

  const trackedAssetDetails = useMemo(() => {
    return watchlistItems
      .map((item) =>
        CURATED_MARKET_ASSETS.find(
          (a) => a.symbol.toUpperCase() === item.symbol.toUpperCase(),
        ),
      )
      .filter((a): a is MarketAsset => Boolean(a));
  }, [watchlistItems]);

  const getAssetBadge = (type: AssetType) => {
    switch (type) {
      case "gh_stock":
        return { label: "GSE Equities", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "us_stock":
        return { label: "US Markets", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "commodity":
        return { label: "Commodity", bg: "bg-amber-50 text-amber-800 border-amber-200" };
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

            <View className="flex-row items-center gap-2">
              <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Phase 1.5 • Market Data
                </Text>
              </View>
            </View>
          </View>

          {/* Screen Title & Value Proposition */}
          <View className="mb-6">
            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Market Watchlist
            </Text>
            <Text className="text-sm text-slate-600 leading-relaxed">
              Observe real price behavior, market sectors, and macroeconomic dynamics across Ghana
              Stock Exchange equities, US index funds, and global commodities — strictly without
              risking real capital.
            </Text>
          </View>

          {/* Educational Non-Advisory Notice Banner (SOP §7) */}
          <View className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 mb-6">
            <View className="flex-row items-start gap-2.5">
              <Text className="text-amber-800 font-bold text-sm">💡</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                  Non-Advisory Educational Observation Only
                </Text>
                <Text className="text-xs text-amber-800/90 leading-relaxed">
                  Kubes never connects to brokerages, executes financial trades, or suggests
                  buying or selling any security. Watchlists exist to train your pattern
                  recognition and build disciplined market awareness.
                </Text>
              </View>
            </View>
          </View>

          {/* My Tracked Assets Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-slate-900">My Watchlist</Text>
                <View className="px-2 py-0.5 rounded-full bg-slate-200">
                  <Text className="text-xs font-bold text-slate-700">
                    {watchlistItems.length}
                  </Text>
                </View>
              </View>
              {watchlistItems.length > 0 && (
                <Text className="text-xs text-slate-500">Tap asset to view education profile</Text>
              )}
            </View>

            {loading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" color="#059669" />
                <Text className="text-xs text-slate-500 mt-2">Loading your watchlist...</Text>
              </View>
            ) : trackedAssetDetails.length === 0 ? (
              <View className="p-6 rounded-3xl bg-white border border-dashed border-slate-300 items-center justify-center text-center">
                <Text className="text-2xl mb-2">📊</Text>
                <Text className="text-sm font-bold text-slate-800 mb-1">
                  Your watchlist is currently empty
                </Text>
                <Text className="text-xs text-slate-500 text-center max-w-sm mb-4 leading-relaxed">
                  Start tracking Ghanaian stocks like MTN Ghana, index funds like the S&P 500, or
                  vital commodities like Cocoa using the discovery list below.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {trackedAssetDetails.map((asset) => {
                  const badge = getAssetBadge(asset.assetType);
                  const change = formatAssetChange(asset.change24h, asset.changePercent24h);

                  return (
                    <TouchableOpacity
                      key={asset.symbol}
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push(`/(app)/watchlist/${asset.symbol}` as any)
                      }
                      className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex-row items-center justify-between"
                    >
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-base font-extrabold text-slate-900">
                            {asset.symbol}
                          </Text>
                          <View
                            className={`px-2 py-0.5 rounded-full border ${badge.bg}`}
                          >
                            <Text className="text-[10px] font-bold uppercase tracking-wider">
                              {badge.label}
                            </Text>
                          </View>
                        </View>
                        <Text
                          className="text-xs text-slate-500 font-medium"
                          numberOfLines={1}
                        >
                          {asset.name}
                        </Text>
                        <Text className="text-[11px] text-slate-400 mt-0.5">
                          {asset.sector}
                        </Text>
                      </View>

                      <View className="items-end gap-1">
                        <Text className="text-base font-extrabold text-slate-900">
                          {formatAssetPrice(asset.price, asset.currency)}
                        </Text>
                        <View
                          className={`px-2 py-0.5 rounded-lg ${
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
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Discovery / Browse Universe Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-2">
              Discover & Track Market Assets
            </Text>
            <Text className="text-xs text-slate-500 mb-4 leading-relaxed">
              Select any asset to add to your personal study watchlist, or tap for full educational
              analysis.
            </Text>

            {/* Search Bar */}
            <View className="mb-4">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by symbol, company name, or sector..."
                placeholderTextColor="#94A3B8"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 font-medium"
              />
            </View>

            {/* Category Filter Tabs */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    onPress={() => setActiveTab(tab.value)}
                    activeOpacity={0.7}
                    className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all ${
                      isActive
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isActive ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Assets Grid / List */}
            <View className="gap-3">
              {displayedAssets.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <Text className="text-xs text-slate-500">
                    No assets matched your search query.
                  </Text>
                </View>
              ) : (
                displayedAssets.map((asset) => {
                  const badge = getAssetBadge(asset.assetType);
                  const isTracked = isSymbolInWatchlist(watchlistItems, asset.symbol);
                  const change = formatAssetChange(asset.change24h, asset.changePercent24h);
                  const isPending = actionInProgress === asset.symbol;

                  return (
                    <View
                      key={asset.symbol}
                      className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm"
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1 pr-3">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-lg font-extrabold text-slate-900">
                              {asset.symbol}
                            </Text>
                            <View
                              className={`px-2 py-0.5 rounded-full border ${badge.bg}`}
                            >
                              <Text className="text-[10px] font-bold uppercase tracking-wider">
                                {badge.label}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-xs font-semibold text-slate-700">
                            {asset.name}
                          </Text>
                          <Text className="text-[11px] text-slate-500 mt-0.5">
                            {asset.market} • {asset.sector}
                          </Text>
                        </View>

                        <View className="items-end">
                          <Text className="text-base font-extrabold text-slate-900">
                            {formatAssetPrice(asset.price, asset.currency)}
                          </Text>
                          <Text
                            className={`text-xs font-bold mt-0.5 ${
                              change.isNeutral
                                ? "text-slate-500"
                                : change.isPositive
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {change.text}
                          </Text>
                        </View>
                      </View>

                      <Text
                        className="text-xs text-slate-600 leading-relaxed mb-4"
                        numberOfLines={2}
                      >
                        {asset.educationalNotes}
                      </Text>

                      {/* Action buttons row */}
                      <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 gap-2">
                        <TouchableOpacity
                          onPress={() =>
                            router.push(`/(app)/watchlist/${asset.symbol}` as any)
                          }
                          activeOpacity={0.7}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 items-center justify-center"
                        >
                          <Text className="text-xs font-bold text-slate-700">
                            Learn More →
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleToggleWatchlist(asset)}
                          disabled={isPending}
                          activeOpacity={0.8}
                          className={`py-2.5 px-4 rounded-xl items-center justify-center flex-row gap-1.5 ${
                            isTracked
                              ? "bg-slate-100 border border-slate-200"
                              : "bg-emerald-600 active:bg-emerald-700"
                          }`}
                        >
                          {isPending ? (
                            <ActivityIndicator
                              size="small"
                              color={isTracked ? "#334155" : "#ffffff"}
                            />
                          ) : (
                            <Text
                              className={`text-xs font-bold ${
                                isTracked ? "text-slate-700" : "text-white"
                              }`}
                            >
                              {isTracked ? "✓ Tracked" : "+ Track"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>

        {/* Global Policy Footer */}
        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

