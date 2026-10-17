import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import { fetchBlogPostBySlug, canAccessBlogPost } from "../../../lib/blog";
import { BlogPost } from "../../../types/blog";
import { PaystackCheckoutModal } from "../../../components/paystack-checkout-modal";
import { PolicyFooter } from "../../../components/policy-footer";

export default function BlogPostDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { profile } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isGated, setIsGated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [devBypass, setDevBypass] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  const isPremiumUser = (profile?.premium_status ?? false) || devBypass;

  useEffect(() => {
    if (slug) {
      fetchBlogPostBySlug(slug, isPremiumUser).then((res) => {
        setPost(res.post);
        setIsGated(res.isGated && !devBypass);
        setLoading(false);
      });
    }
  }, [slug, isPremiumUser, devBypass]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FB] items-center justify-center p-6">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-sm text-slate-500 mt-4">Loading article...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FB] items-center justify-center p-6">
        <Text className="text-lg font-bold text-slate-900 mb-2">Insight Not Found</Text>
        <Text className="text-sm text-slate-500 mb-4 text-center">
          The requested article does not exist or may have been moved.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(app)/blog" as any)}
          className="py-2.5 px-4 bg-emerald-600 rounded-xl"
        >
          <Text className="text-xs font-bold text-white uppercase">Return to Insights</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const paragraphs = post.body.split("\n\n").filter((p) => p.trim().length > 0);
  const isDev = process.env.EXPO_PUBLIC_APP_ENV === "development";

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className="flex-1 px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full justify-between no-scrollbar"
      >
        <View>
          {/* Top Bar Navigation */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => router.replace("/(app)/blog" as any)}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">← All Insights</Text>
            </TouchableOpacity>

            <View className="flex-row items-center space-x-2">
              <View className="px-3 py-1 bg-slate-100 rounded-full mr-2">
                <Text className="text-xs font-semibold text-slate-600">
                  {post.read_time_mins || 3} min read
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  post.is_premium ? "bg-amber-100" : "bg-emerald-50"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-wider ${
                    post.is_premium ? "text-amber-800" : "text-emerald-800"
                  }`}
                >
                  {post.is_premium ? "Premium 🔒" : "Free"}
                </Text>
              </View>
            </View>
          </View>

          {/* Article Header Card */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
            <View className="self-start px-3 py-1 bg-slate-100 rounded-full mb-3">
              <Text className="text-slate-600 text-xs font-bold uppercase tracking-wider">
                {post.category || "Market Insight"}
              </Text>
            </View>

            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3 leading-snug">
              {post.title}
            </Text>

            <View className="flex-row items-center pb-4 border-b border-slate-100 mb-6">
              <Text className="text-xs text-slate-400 font-medium">
                By {post.author} • Published{" "}
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : "Recently"}
              </Text>
            </View>

            {/* Article Content or Paywall */}
            {isGated ? (
              <View>
                {/* Teaser Paragraphs */}
                <Text className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                  {paragraphs[0] || post.excerpt}
                </Text>

                {/* Calm Premium Gate Card */}
                <View className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 items-center text-center mb-4">
                  <View className="w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center mb-3">
                    <Text className="text-xl">🔒</Text>
                  </View>

                  <Text className="text-lg font-bold text-amber-950 mb-1 text-center">
                    Exclusive to Lifetime Premium
                  </Text>
                  <Text className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed mb-5 max-w-md">
                    This market analysis is part of the Kubes Founder series. Gain unlimited lifetime access to all 7 Investing 101 lessons and every future market breakdown for a one-time payment ($20 / GH₵ equivalent).
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowCheckoutModal(true)}
                    activeOpacity={0.85}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-xs"
                  >
                    <Text className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Unlock Lifetime Premium ($20) →
                    </Text>
                  </TouchableOpacity>

                  {isDev && (
                    <TouchableOpacity
                      onPress={() => setDevBypass(true)}
                      className="mt-4 pt-3 border-t border-amber-200/80"
                    >
                      <Text className="text-[11px] font-bold text-amber-900 underline">
                        🛠️ Dev Mode: Preview full article
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              /* Full Article Reader */
              <View className="space-y-4">
                {paragraphs.map((paragraph, idx) => (
                  <Text
                    key={idx}
                    className="text-base text-slate-700 leading-relaxed mb-4 font-normal"
                  >
                    {paragraph}
                  </Text>
                ))}

                {/* Author Signature */}
                <View className="pt-6 mt-6 border-t border-slate-100 flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs font-bold text-slate-800">
                      {post.author}
                    </Text>
                    <Text className="text-[10px] text-slate-400">
                      Kubes Educational Editorial
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.replace("/(app)/blog" as any)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
                  >
                    <Text className="text-xs font-bold text-slate-700">← Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Compliance Disclaimer Footer per SOP §7 */}
        <PolicyFooter />
      </ScrollView>

      <PaystackCheckoutModal
        visible={showCheckoutModal}
        initialPlanType="lifetime_premium"
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={() => {
          setIsGated(false);
        }}
      />
    </SafeAreaView>
  );
}

