import React, { useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  GSE_BENCHMARK_INDICES,
  GSE_TRADING_STEPS,
  getExpandedGseAssets,
  getGseMarketOverview,
  getGseMarketStatus,
  getGseSectorBreakdown,
} from "../../../lib/gse-market";
import { formatAssetChange, formatAssetPrice } from "../../../lib/watchlist";
import { PolicyFooter } from "../../../components/policy-footer";

export default function GseMarketScreen() {
  const router = useRouter();

  const marketStatus = useMemo(() => getGseMarketStatus(), []);
  const marketOverview = useMemo(() => getGseMarketOverview(), []);
  const gseAssets = useMemo(() => getExpandedGseAssets(), []);
  const sectors = useMemo(() => getGseSectorBreakdown(), []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-2 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.replace("/(app)/dashboard" as any)}
            className="flex-row items-center"
          >
            <Text className="text-slate-500 text-sm">← Dashboard</Text>
          </TouchableOpacity>
          <View className="bg-emerald-100 rounded-full px-3 py-1">
            <Text className="text-emerald-800 text-xs font-semibold">
              Phase 2 · Market Data
            </Text>
          </View>
        </View>

        <View className="px-6 pb-3">
          <Text className="text-2xl font-bold text-slate-900">
            🇬🇭 Ghana Stock Exchange
          </Text>
          <Text className="text-slate-500 text-sm mt-1">
            Expanded market overview, benchmark indices, and equity directory
          </Text>
        </View>

        {/* Market Status Banner */}
        <View className="mx-6 mb-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View
                className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  marketStatus.isOpen ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <Text className="text-slate-900 font-bold text-sm">
                {marketStatus.statusText}
              </Text>
            </View>
            <Text className="text-slate-400 text-xs font-mono">
              {marketStatus.currentGmtTime}
            </Text>
          </View>
          <Text className="text-slate-600 text-xs leading-relaxed">
            {marketStatus.notes}
          </Text>
          <View className="mt-2 pt-2 border-t border-slate-100 flex-row items-center justify-between">
            <Text className="text-slate-400 text-[11px]">Regular Trading Hours</Text>
            <Text className="text-slate-700 text-[11px] font-medium">
              {marketStatus.tradingHours}
            </Text>
          </View>
        </View>

        {/* Non-advisory notice */}
        <View className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <Text className="text-blue-900 text-xs leading-relaxed">
            ℹ️ Educational Framing Only: Prices, changes, and index indicators are
            published for general learning and market awareness. Kubes is not a
            brokerage and never provides investment advice or buy/sell directives.
          </Text>
        </View>

        {/* Benchmark Indices */}
        <View className="px-6 mb-4">
          <Text className="text-slate-900 font-bold text-base mb-3">
            Benchmark Indices
          </Text>
          <View className="gap-3">
            {GSE_BENCHMARK_INDICES.map((idx) => {
              const isPositive = idx.change >= 0;
              return (
                <View
                  key={idx.symbol}
                  className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm"
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center">
                      <Text className="text-slate-900 font-bold text-base mr-2">
                        {idx.symbol}
                      </Text>
                      <View className="px-2 py-0.5 bg-slate-100 rounded-md">
                        <Text className="text-slate-600 text-[10px] font-semibold">
                          Index
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`px-2.5 py-1 rounded-full ${
                        isPositive ? "bg-emerald-50" : "bg-red-50"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isPositive ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {idx.changePercent.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-500 text-xs mb-3">{idx.name}</Text>
                  <Text className="text-2xl font-bold text-slate-900 mb-2">
                    {idx.level.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <Text className="text-xs text-slate-400 font-normal">pts</Text>
                  </Text>
                  <Text className="text-slate-600 text-xs leading-relaxed mb-2">
                    {idx.description}
                  </Text>
                  <View className="p-3 bg-slate-50 rounded-xl">
                    <Text className="text-slate-500 text-[11px] leading-relaxed">
                      💡 {idx.historicalContext}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Expanded Equities Directory */}
        <View className="px-6 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-900 font-bold text-base">
              Listed Equities ({gseAssets.length})
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/watchlist" as any)}
            >
              <Text className="text-indigo-600 text-xs font-bold">
                Watchlist View →
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-2">
            {gseAssets.map((asset) => {
              const formattedPrice = formatAssetPrice(asset.price, asset.currency);
              const formattedChange = formatAssetChange(
                asset.change24h,
                asset.changePercent24h
              );
              return (
                <TouchableOpacity
                  key={asset.symbol}
                  onPress={() =>
                    router.push(`/(app)/watchlist/${asset.symbol}` as any)
                  }
                  activeOpacity={0.7}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-slate-900 font-bold text-sm">
                        {asset.symbol}
                      </Text>
                      <View className="px-2 py-0.5 bg-slate-100 rounded-md">
                        <Text className="text-slate-600 text-[10px]">
                          {asset.sector}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-slate-500 text-xs"
                      numberOfLines={1}
                    >
                      {asset.name}
                    </Text>
                    {asset.metrics.marketCapOrSize && (
                      <Text className="text-slate-400 text-[11px] mt-1">
                        Cap: {asset.metrics.marketCapOrSize}
                      </Text>
                    )}
                  </View>

                  <View className="items-end">
                    <Text className="text-slate-900 font-bold text-sm mb-1">
                      {formattedPrice}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        formattedChange.isPositive
                          ? "bg-emerald-50"
                          : formattedChange.isNeutral
                          ? "bg-slate-100"
                          : "bg-red-50"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          formattedChange.isPositive
                            ? "text-emerald-700"
                            : formattedChange.isNeutral
                            ? "text-slate-600"
                            : "text-red-700"
                        }`}
                      >
                        {formattedChange.isPositive ? "+" : ""}
                        {asset.changePercent24h.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sector Breakdown */}
        <View className="mx-6 mb-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Text className="text-slate-900 font-bold text-base mb-3">
            GSE Sector Composition
          </Text>
          <View className="gap-3">
            {sectors.map((sec) => (
              <View key={sec.sector} className="pb-3 border-b border-slate-50 last:border-b-0">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-slate-800 font-semibold text-xs">
                    {sec.sector}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {sec.companiesCount} compan{sec.companiesCount !== 1 ? "ies" : "y"}
                  </Text>
                </View>
                <Text className="text-slate-500 text-[11px] leading-relaxed mb-1.5">
                  {sec.description}
                </Text>
                <View className="flex-row flex-wrap gap-1">
                  {sec.symbols.map((sym) => (
                    <View
                      key={sym}
                      className="px-2 py-0.5 bg-slate-100 rounded-md"
                    >
                      <Text className="text-slate-700 font-mono text-[10px]">
                        {sym}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Market Structure & How Trading Works */}
        <View className="mx-6 mb-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Text className="text-slate-900 font-bold text-base mb-2">
            🏛️ Exchange Structure & Rules
          </Text>
          <View className="gap-2 mb-4">
            <View className="flex-row justify-between py-1.5 border-b border-slate-50">
              <Text className="text-slate-500 text-xs">Regulatory Authority</Text>
              <Text className="text-slate-800 font-medium text-xs">
                {marketOverview.regulatoryBody}
              </Text>
            </View>
            <View className="flex-row justify-between py-1.5 border-b border-slate-50">
              <Text className="text-slate-500 text-xs">Central Depository</Text>
              <Text className="text-slate-800 font-medium text-xs">
                {marketOverview.depository}
              </Text>
            </View>
            <View className="flex-row justify-between py-1.5 border-b border-slate-50">
              <Text className="text-slate-500 text-xs">Settlement Timeline</Text>
              <Text className="text-slate-800 font-medium text-xs">
                {marketOverview.settlementCycle}
              </Text>
            </View>
            <View className="flex-row justify-between py-1.5">
              <Text className="text-slate-500 text-xs">Base Trading Currency</Text>
              <Text className="text-slate-800 font-medium text-xs">
                {marketOverview.tradingCurrency}
              </Text>
            </View>
          </View>

          <Text className="text-slate-900 font-bold text-sm mb-3">
            Practical Steps: How to Invest on the GSE
          </Text>
          <View className="gap-3">
            {GSE_TRADING_STEPS.map((s) => (
              <View key={s.step} className="p-3 bg-slate-50 rounded-2xl">
                <View className="flex-row items-center mb-1">
                  <View className="w-5 h-5 rounded-full bg-indigo-600 items-center justify-center mr-2">
                    <Text className="text-white font-bold text-[10px]">
                      {s.step}
                    </Text>
                  </View>
                  <Text className="text-slate-900 font-bold text-xs flex-1">
                    {s.title}
                  </Text>
                </View>
                <Text className="text-slate-600 text-xs leading-relaxed mb-2">
                  {s.description}
                </Text>
                {s.keyDetails.map((detail, idx) => (
                  <Text key={idx} className="text-slate-500 text-[11px] leading-relaxed mb-0.5">
                    • {detail}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>

        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
