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
import { useAuth } from "../../../contexts/auth";
import {
    canAccessLesson,
    fetchUserProgress,
    getAllLessons,
    isLessonUnlocked,
} from "../../../lib/curriculum";
import { Lesson, UserLessonProgress } from "../../../types/curriculum";

export default function CurriculumOverviewScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [lessons] = useState<Lesson[]>(getAllLessons());
  const [progressList, setProgressList] = useState<UserLessonProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress(user.id).then((data) => {
        setProgressList(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const completedLessonIds = progressList.map((p) => p.lesson_id);
  const completedCount = completedLessonIds.length;
  const totalCount = lessons.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const isPremium = profile?.premium_status ?? false;

  const handleLessonPress = (
    lesson: Lesson,
    accessible: boolean,
    unlocked: boolean,
  ) => {
    if (!accessible) {
      alert(
        "Please complete the preceding lesson's quiz first to unlock this lesson.",
      );
      return;
    }
    if (!unlocked) {
      alert(
        `This lesson requires an unlock (GH₵0.50) or Lifetime Premium ($20). Payment integration activates in Task 9.`,
      );
      // In dev mode, still allow navigating
      if (process.env.EXPO_PUBLIC_APP_ENV === "development") {
        router.push(`/(app)/curriculum/${lesson.slug}` as any);
      }
      return;
    }
    router.push(`/(app)/curriculum/${lesson.slug}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
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
              <Text className="text-xs font-bold text-slate-700">
                ← Dashboard
              </Text>
            </TouchableOpacity>

            <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
              <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Investing 101 Track
              </Text>
            </View>
          </View>

          {/* Curriculum Hero Header Card */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Investing 101 Curriculum
            </Text>
            <Text className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6">
              A 7-lesson foundational sequence covering the mechanics of the
              Ghana Stock Exchange, US index funds, compounding arithmetic, and
              disciplined habits.
            </Text>

            {/* Momentum & Progress Gauge */}
            <View className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Course Progress
                </Text>
                <Text className="text-xs font-bold text-emerald-700">
                  {completedCount} of {totalCount} Completed (
                  {completionPercentage}%)
                </Text>
              </View>
              <View className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <View
                  style={{ width: `${completionPercentage}%` }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </View>
            </View>
          </View>

          {/* Lesson List */}
          <Text className="text-lg font-bold text-slate-900 mb-4 px-1">
            Lessons & Quizzes
          </Text>

          {loading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator color="#059669" size="large" />
            </View>
          ) : (
            <View className="space-y-4 mb-8">
              {lessons.map((lesson) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const accessible = canAccessLesson(
                  lesson.order_index,
                  completedLessonIds,
                );
                const unlocked = isLessonUnlocked(lesson, isPremium);

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() =>
                      handleLessonPress(lesson, accessible, unlocked)
                    }
                    activeOpacity={accessible && unlocked ? 0.75 : 0.9}
                    className={`p-5 rounded-3xl border transition-all mb-4 ${
                      isCompleted
                        ? "bg-emerald-50/40 border-emerald-200 shadow-xs"
                        : accessible && unlocked
                          ? "bg-white border-slate-200/90 shadow-sm active:border-emerald-500"
                          : "bg-slate-100/70 border-slate-200 opacity-80"
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center space-x-2">
                        <View
                          className={`w-7 h-7 rounded-xl items-center justify-center mr-2 ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              isCompleted ? "text-white" : "text-slate-700"
                            }`}
                          >
                            {isCompleted ? "✓" : lesson.order_index}
                          </Text>
                        </View>
                        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {lesson.category} • {lesson.read_time_mins} min read
                        </Text>
                      </View>

                      {/* Status Badges */}
                      {isCompleted ? (
                        <View className="px-2.5 py-0.5 bg-emerald-100 rounded-full">
                          <Text className="text-[10px] font-bold text-emerald-800 uppercase">
                            Passed ✓
                          </Text>
                        </View>
                      ) : lesson.is_free ? (
                        <View className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full">
                          <Text className="text-[10px] font-bold text-emerald-800 uppercase">
                            Free
                          </Text>
                        </View>
                      ) : unlocked ? (
                        <View className="px-2.5 py-0.5 bg-slate-100 rounded-full">
                          <Text className="text-[10px] font-bold text-slate-700 uppercase">
                            Unlocked
                          </Text>
                        </View>
                      ) : (
                        <View className="px-2.5 py-0.5 bg-slate-200 rounded-full">
                          <Text className="text-[10px] font-bold text-slate-600 uppercase">
                            🔒 GH₵0.50
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-base font-bold text-slate-900 mb-1">
                      {lesson.title}
                    </Text>

                    <Text className="text-sm text-slate-500 leading-normal mb-4">
                      {lesson.summary}
                    </Text>

                    {/* Bottom CTA Row */}
                    <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                      <Text className="text-xs font-medium text-slate-500">
                        {isCompleted
                          ? "Quiz Completed • Review Lesson"
                          : accessible && unlocked
                            ? "Ready to Start • 3 Questions"
                            : !accessible
                              ? "Pass previous lesson to unlock"
                              : "Unlock required (GH₵0.50)"}
                      </Text>

                      <View className="flex-row items-center space-x-1">
                        <Text
                          className={`text-xs font-bold ${
                            accessible && unlocked
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }`}
                        >
                          {isCompleted ? "Review" : "Start"} →
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Compliance Footer per SOP §7 */}
        <View className="pt-6 pb-2 border-t border-slate-200/70">
          <Text className="text-xs text-slate-500 text-center leading-relaxed">
            This platform is for education only. Nothing here is financial,
            investment, or trading advice, and no outcome is promised. Kubes is
            not a registered investment advisor or broker-dealer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
