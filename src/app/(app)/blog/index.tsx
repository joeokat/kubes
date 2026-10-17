import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import { fetchBlogPosts } from "../../../lib/blog";
import { BlogPost } from "../../../types/blog";
import { PolicyFooter } from "../../../components/policy-footer";

export default function BlogOverviewScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "free" | "premium">("all");
  const [loading, setLoading] = useState<boolean>(true);

  const isPremium = profile?.premium_status ?? false;

  useEffect(() => {
    fetchBlogPosts().then((res) => {
      setPosts(res.data);
      setLoading(false);
    });
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "free") return !p.is_premium;
    if (activeTab === "premium") return p.is_premium;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full justify-between no-scrollbar"
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

            <View className="flex-row items-center space-x-2">
              <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
                <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {isPremium ? "★ Premium Member" : "Market Insights"}
                </Text>
              </View>
            </View>
          </View>

          {/* Hero Header Card */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
            <View className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 items-center justify-center mb-4">
              <Text className="text-emerald-700 font-bold text-xl">📰</Text>
            </View>

            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Market News & Insights
            </Text>
            <Text className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6">
              Calm, evidence-based market explainers and macro analysis published by the founder to help beginners navigate investing without sensationalism.
            </Text>

            {/* Filter Tabs */}
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => setActiveTab("all")}
                activeOpacity={0.8}
                className={`py-2 px-4 rounded-xl border mr-2 ${
                  activeTab === "all"
                    ? "bg-slate-900 border-slate-900"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    activeTab === "all" ? "text-white" : "text-slate-700"
                  }`}
                >
                  All ({posts.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("free")}
                activeOpacity={0.8}
                className={`py-2 px-4 rounded-xl border mr-2 ${
                  activeTab === "free"
                    ? "bg-slate-900 border-slate-900"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    activeTab === "free" ? "text-white" : "text-slate-700"
                  }`}
                >
                  Free Reads
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("premium")}
                activeOpacity={0.8}
                className={`py-2 px-4 rounded-xl border ${
                  activeTab === "premium"
                    ? "bg-slate-900 border-slate-900"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    activeTab === "premium" ? "text-white" : "text-slate-700"
                  }`}
                >
                  Premium 🔒
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Posts List */}
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-sm text-slate-500 mt-4">Loading insights...</Text>
            </View>
          ) : (
            <View className="space-y-4 mb-8">
              {filteredPosts.map((post) => {
                const canRead = !post.is_premium || isPremium;

                return (
                  <TouchableOpacity
                    key={post.id}
                    onPress={() => router.push(`/(app)/blog/${post.slug}` as any)}
                    activeOpacity={0.85}
                    className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all mb-4"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center space-x-2">
                        <View className="px-2.5 py-0.5 rounded-full bg-slate-100 mr-2">
                          <Text className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                            {post.category || "Article"}
                          </Text>
                        </View>
                        <Text className="text-xs text-slate-400">
                          {post.read_time_mins || 3} min read
                        </Text>
                      </View>

                      <View
                        className={`px-2.5 py-0.5 rounded-full ${
                          post.is_premium
                            ? isPremium
                              ? "bg-emerald-100"
                              : "bg-amber-100"
                            : "bg-emerald-50"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            post.is_premium
                              ? isPremium
                                ? "text-emerald-800"
                                : "text-amber-800"
                              : "text-emerald-800"
                          }`}
                        >
                          {post.is_premium
                            ? isPremium
                              ? "Unlocked ✓"
                              : "🔒 Premium"
                            : "Free Read"}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                      {post.title}
                    </Text>

                    <Text className="text-sm text-slate-500 leading-relaxed mb-4">
                      {post.excerpt}
                    </Text>

                    <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                      <Text className="text-xs font-medium text-slate-400">
                        By {post.author}
                      </Text>
                      <Text className="text-xs font-bold text-emerald-700">
                        {canRead ? "Read Full Post →" : "View Preview 🔒"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Compliance Disclaimer Footer per SOP §7 */}
        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

