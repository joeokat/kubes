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
import {
  CURATED_MARKET_INTELLIGENCE,
  filterMarketIntelligenceByCategory,
  searchMarketIntelligence,
  formatPublishedDate,
  fetchMarketIntelligence,
} from "../../../lib/market-intelligence";
import type {
  MarketNewsCategory,
  MarketIntelligenceItem,
} from "../../../types/market-intelligence";
import { PolicyFooter } from "../../../components/policy-footer";

const CATEGORY_TABS: { label: string; value: MarketNewsCategory | "all" }[] = [
  { label: "All News", value: "all" },
  { label: "Ghana (GSE)", value: "gse_ghana" },
  { label: "Macro & BoG", value: "macro_africa" },
  { label: "US & Global", value: "us_global" },
  { label: "Commodities", value: "commodities" },
];

export default function MarketFeedScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<MarketNewsCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [feedItems, setFeedItems] = useState<MarketIntelligenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    fetchMarketIntelligence("all").then((res) => {
      if (mounted) {
        setFeedItems(res.data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const displayedItems = useMemo(() => {
    const filteredByCategory = filterMarketIntelligenceByCategory(feedItems, activeTab);
    return searchMarketIntelligence(filteredByCategory, searchQuery);
  }, [feedItems, activeTab, searchQuery]);

  const getCategoryBadge = (category: MarketNewsCategory) => {
    switch (category) {
      case "gse_ghana":
        return { label: "GSE Equities", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "macro_africa":
        return { label: "Macro & Policy", bg: "bg-purple-50 text-purple-800 border-purple-200" };
      case "us_global":
        return { label: "Global / US", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "commodities":
        return { label: "Commodities", bg: "bg-amber-50 text-amber-800 border-amber-200" };
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
                Phase 1.5 • Curated Intelligence
              </Text>
            </View>
          </View>

          {/* Screen Header */}
          <View className="mb-6">
            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Market Intelligence
            </Text>
            <Text className="text-sm text-slate-600 leading-relaxed">
              Curated market headlines, central bank policy announcements, and commodity supply
              updates — decoded with plain-language takeaways for everyday Ghanaian learners.
            </Text>
          </View>

          {/* Non-Advisory Compliance Notice (SOP §7) */}
          <View className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 mb-6">
            <View className="flex-row items-start gap-2.5">
              <Text className="text-amber-800 font-bold text-sm">💡</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                  Educational Intelligence • Founder Approved
                </Text>
                <Text className="text-xs text-amber-800/90 leading-relaxed">
                  Headlines are verified and aggregated to teach economic awareness. Kubes never
                  provides speculative trading signals, buy/sell directives, or price targets.
                </Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search news by topic, source, or impact (e.g. inflation, BoG, MTN)..."
              placeholderTextColor="#94A3B8"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 font-medium"
            />
          </View>

          {/* Category Filter Tabs */}
          <View className="flex-row flex-wrap gap-2 mb-6">
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

          {/* News Feed Stream */}
          {loading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="small" color="#059669" />
              <Text className="text-xs text-slate-500 mt-2">Loading curated intelligence...</Text>
            </View>
          ) : displayedItems.length === 0 ? (
            <View className="p-8 rounded-3xl bg-white border border-slate-200 items-center justify-center">
              <Text className="text-3xl mb-2">📰</Text>
              <Text className="text-sm font-bold text-slate-800 mb-1">No headlines found</Text>
              <Text className="text-xs text-slate-500 text-center">
                Try adjusting your search keywords or switching category filters.
              </Text>
            </View>
          ) : (
            <View className="gap-4 mb-6">
              {displayedItems.map((item) => {
                const badge = getCategoryBadge(item.category);

                return (
                  <View
                    key={item.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-sm"
                  >
                    {/* Header: Badges & Source */}
                    <View className="flex-row flex-wrap items-center justify-between gap-2 mb-3">
                      <View className="flex-row items-center gap-2">
                        <View className={`px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                          <Text className="text-[10px] font-bold uppercase tracking-wider">
                            {badge.label}
                          </Text>
                        </View>
                        <View className="px-2 py-0.5 rounded-full bg-slate-100">
                          <Text className="text-[10px] font-semibold text-slate-600">
                            {item.impact_tag}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-[11px] text-slate-400 font-medium">
                        {formatPublishedDate(item.published_at)}
                      </Text>
                    </View>

                    {/* Headline */}
                    <Text className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug mb-2">
                      {item.title}
                    </Text>

                    {/* Source Name */}
                    <Text className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-3">
                      Source: {item.source_name}
                    </Text>

                    {/* Summary */}
                    <Text className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {item.summary}
                    </Text>

                    {/* Highlighted Educational Takeaway */}
                    <View className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                      <View className="flex-row items-center gap-1.5 mb-1.5">
                        <Text className="text-emerald-800 font-bold text-xs">💡</Text>
                        <Text className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">
                          What this means for everyday learners
                        </Text>
                      </View>
                      <Text className="text-xs text-emerald-900/90 leading-relaxed">
                        {item.educational_takeaway}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Global Policy Footer */}
        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

