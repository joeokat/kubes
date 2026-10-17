import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ForumReportModal } from "../../../components/forum-report-modal";
import { fetchForumThreads, FORUM_CATEGORIES } from "../../../lib/forum";
import type {
  ForumCategory,
  ForumReportTarget,
  ForumThread,
} from "../../../types/forum";

export default function ForumScreen() {
  const router = useRouter();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [reportTarget, setReportTarget] = useState<ForumReportTarget | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadThreads = async () => {
    setLoading(true);
    setErrorMessage(null);
    const result = await fetchForumThreads(category ?? undefined);
    setThreads(result.data);
    setErrorMessage(result.error?.message ?? null);
    setLoading(false);
  };

  useEffect(() => {
    void loadThreads();
  }, [category]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full"
      >
        <View>
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => router.replace("/(app)/dashboard" as any)}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">
                ← Dashboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(app)/forum/new" as any)}
              className="py-2.5 px-4 rounded-xl bg-emerald-700"
            >
              <Text className="text-xs font-bold text-white">
                ＋ New discussion
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-extrabold text-slate-900 mb-1">
            Community forum
          </Text>
          <Text className="text-sm text-slate-500 mb-5">
            Share questions and experiences. Keep discussions respectful and
            educational.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-5"
          >
            <TouchableOpacity
              onPress={() => setCategory(null)}
              className={`px-4 py-2 rounded-full border mr-2 ${
                category === null
                  ? "bg-emerald-700 border-emerald-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${category === null ? "text-white" : "text-slate-700"}`}
              >
                All topics
              </Text>
            </TouchableOpacity>
            {FORUM_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                className={`px-4 py-2 rounded-full border mr-2 ${
                  category === item
                    ? "bg-emerald-700 border-emerald-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${category === item ? "text-white" : "text-slate-700"}`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-sm text-slate-500 mt-4">
                Loading discussions...
              </Text>
            </View>
          ) : errorMessage ? (
            <View className="bg-white rounded-2xl border border-slate-200 p-5">
              <Text className="text-sm text-red-700 mb-4">
                Could not load discussions: {errorMessage}
              </Text>
              <TouchableOpacity
                onPress={loadThreads}
                className="self-start px-4 py-2.5 rounded-xl bg-emerald-700"
              >
                <Text className="text-sm font-bold text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : threads.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-200 p-6 items-center">
              <Text className="text-base font-semibold text-slate-800 mb-1">
                No discussions yet
              </Text>
              <Text className="text-sm text-slate-500 text-center">
                Start a conversation in this topic.
              </Text>
            </View>
          ) : (
            threads.map((thread) => (
              <View
                key={thread.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 mb-3"
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/(app)/forum/${thread.id}` as any)
                  }
                  activeOpacity={0.75}
                >
                  <Text className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    {thread.category}
                  </Text>
                  <Text className="text-base font-bold text-slate-900 mb-2">
                    {thread.title}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    Community member ·{" "}
                    {new Date(thread.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <View className="flex-row justify-end border-t border-slate-100 mt-3 pt-2">
                  <TouchableOpacity
                    onPress={() =>
                      setReportTarget({ type: "thread", id: thread.id })
                    }
                    className="py-1.5 px-2"
                  >
                    <Text className="text-xs font-semibold text-red-700">
                      Report discussion
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <ForumReportModal
        target={reportTarget}
        onClose={() => setReportTarget(null)}
      />
    </SafeAreaView>
  );
}
