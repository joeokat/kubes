import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GuidedWalkthrough } from "../../components/guided-walkthrough";
import { useAuth } from "../../contexts/auth";
import { fetchUserProgress } from "../../lib/curriculum";
import { ONBOARDING_STEPS } from "../../lib/onboarding";
import {
    isWalkthroughCompleted,
    resetWalkthroughStatus,
} from "../../lib/walkthrough";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(false);
  const [activeHighlightTarget, setActiveHighlightTarget] = useState<
    string | null
  >(null);
  const [completedLessonsCount, setCompletedLessonsCount] = useState<number>(0);

  // Check walkthrough status on initial mount
  useEffect(() => {
    isWalkthroughCompleted().then((completed) => {
      if (!completed) {
        setShowWalkthrough(true);
        setActiveHighlightTarget("curriculum");
      }
    });
  }, []);

  // Fetch real lesson progress
  useEffect(() => {
    if (user) {
      fetchUserProgress(user.id).then((progress) => {
        setCompletedLessonsCount(progress.length);
      });
    }
  }, [user]);

  const handleStartTour = async () => {
    await resetWalkthroughStatus();
    setActiveHighlightTarget("curriculum");
    setShowWalkthrough(true);
  };

  const handleWalkthroughStepChange = (
    _stepIndex: number,
    targetId: string,
  ) => {
    setActiveHighlightTarget(targetId);
  };

  const handleCloseTour = () => {
    setShowWalkthrough(false);
    setActiveHighlightTarget(null);
  };

  // Map IDs to human-readable labels from onboarding definitions
  const getLabel = (
    fieldName: "interest_area" | "experience_level" | "goal",
    val: string | null | undefined,
  ) => {
    if (!val) return "Not specified";
    const step = ONBOARDING_STEPS.find((s) => s.fieldName === fieldName);
    const opt = step?.options.find((o) => o.id === val);
    return opt ? opt.label : val;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Bar Navigation */}
          <View className="flex-row items-center justify-between pb-5 border-b border-slate-200/80 mb-6">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 rounded-2xl bg-emerald-600 items-center justify-center shadow-sm">
                <Text className="text-white text-lg font-bold">K</Text>
              </View>
              <View className="ml-2">
                <Text className="text-xl font-bold text-slate-900 tracking-tight">
                  Kubes
                </Text>
                <Text className="text-xs font-semibold text-emerald-700">
                  Investment Education
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-2">
              <TouchableOpacity
                onPress={handleStartTour}
                activeOpacity={0.75}
                className="py-2 px-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 mr-2 active:bg-emerald-100"
              >
                <Text className="text-xs font-bold text-emerald-800">
                  ✨ Tour Guide
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={signOut}
                activeOpacity={0.75}
                className="py-2 px-3.5 rounded-xl border border-slate-200 bg-white shadow-xs active:bg-slate-50"
              >
                <Text className="text-xs font-semibold text-slate-700">
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Learning Momentum Hero Banner */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
            <View className="flex-row flex-wrap items-center justify-between gap-2 mb-4">
              <View className="flex-row items-center space-x-2">
                <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60 mr-2">
                  <Text className="text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                    {getLabel("interest_area", profile?.interest_area)}
                  </Text>
                </View>
                <View className="px-3 py-1 bg-slate-100 rounded-full">
                  <Text className="text-slate-600 text-xs font-medium">
                    🔥 1 Day Streak
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-slate-500 font-medium">
                {user?.email || "Learner"}
              </Text>
            </View>

            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Welcome back, {profile?.name || "Learner"}
            </Text>

            <Text className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6">
              Your customized track is primed to help you{" "}
              <Text className="font-semibold text-slate-800">
                {getLabel("goal", profile?.goal).toLowerCase()}
              </Text>
              . Explore your core tools below.
            </Text>

            {/* Momentum Bar */}
            <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Investing 101 Progress
                </Text>
                <Text className="text-xs font-bold text-emerald-700">
                  {completedLessonsCount} of 7 Lessons Completed (
                  {Math.round((completedLessonsCount / 7) * 100)}%)
                </Text>
              </View>
              <View className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${Math.round((completedLessonsCount / 7) * 100)}%`,
                  }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </View>
            </View>
          </View>

          {/* Section Heading */}
          <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-lg font-bold text-slate-900">
              Core Modules & Tools
            </Text>
            <Text className="text-xs font-medium text-slate-500">
              Self-paced & Habit-driven
            </Text>
          </View>

          {/* Module Grid */}
          <View className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Module 1: Curriculum Track */}
            <View
              className={`p-6 rounded-3xl bg-white border transition-all mb-4 ${
                activeHighlightTarget === "curriculum"
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-100 shadow-sm"
              }`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 items-center justify-center">
                  <Text className="text-emerald-700 font-bold text-base">
                    📚
                  </Text>
                </View>
                <View className="px-2.5 py-0.5 bg-emerald-100 rounded-full">
                  <Text className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    {completedLessonsCount === 7
                      ? "Track Complete 🎉"
                      : "Lesson 1 Free"}
                  </Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-slate-900 mb-1">
                Investing 101 Curriculum
              </Text>
              <Text className="text-sm text-slate-500 leading-normal mb-5">
                Understand the Ghana Stock Exchange, US equity index funds, and
                compounding returns without confusing jargon.
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(app)/curriculum" as any)}
                activeOpacity={0.8}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-xs"
              >
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  {completedLessonsCount > 0
                    ? "Continue Track →"
                    : "Start Free Lesson 1 →"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Module 2: Financial Health Meter */}
            <View
              className={`p-6 rounded-3xl bg-white border transition-all mb-4 ${
                activeHighlightTarget === "health_meter"
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-100 shadow-sm"
              }`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center">
                  <Text className="text-blue-700 font-bold text-base">🩺</Text>
                </View>
                <View className="px-2.5 py-0.5 bg-slate-100 rounded-full">
                  <Text className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    Assessment
                  </Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-slate-900 mb-1">
                Financial Health Meter
              </Text>
              <Text className="text-sm text-slate-500 leading-normal mb-3">
                Evaluate your income, monthly spending buckets, savings rate,
                and emergency runway into a clear score band.
              </Text>

              {/* Aurex/Finor circular radial score preview tile */}
              <View className="flex-row items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
                <View>
                  <Text className="text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </Text>
                  <Text className="text-sm font-bold text-slate-900">
                    Needs Assessment
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-500 items-center justify-center">
                  <Text className="text-xs font-bold text-slate-700">--</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white active:bg-slate-50 items-center justify-center"
              >
                <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Take Health Quiz
                </Text>
              </TouchableOpacity>
            </View>

            {/* Module 3: 90-Day Savings Challenge */}
            <View
              className={`p-6 rounded-3xl bg-white border transition-all mb-4 ${
                activeHighlightTarget === "savings_challenge"
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-100 shadow-sm"
              }`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 items-center justify-center">
                  <Text className="text-amber-700 font-bold text-base">🎯</Text>
                </View>
                <View className="px-2.5 py-0.5 bg-amber-100 rounded-full">
                  <Text className="text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                    Streak Builder
                  </Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-slate-900 mb-1">
                90-Day Savings Challenge
              </Text>
              <Text className="text-sm text-slate-500 leading-normal mb-3">
                Set a personal target, choose any savings vehicle, and log
                manual contributions to build an unshakeable habit.
              </Text>

              {/* Segmented dot progress bar (Aurex goal pattern) */}
              <View className="p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-xs font-semibold text-slate-600">
                    Day 0 of 90
                  </Text>
                  <Text className="text-xs font-bold text-slate-800">
                    Target: Flexible
                  </Text>
                </View>
                <View className="flex-row space-x-1">
                  {[...Array(12)].map((_, i) => (
                    <View
                      key={i}
                      className="flex-1 h-2 rounded-sm bg-slate-200 mr-1"
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white active:bg-slate-50 items-center justify-center"
              >
                <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Join 90-Day Challenge
                </Text>
              </TouchableOpacity>
            </View>

            {/* Module 4: Expense Tracker & Budgeting Framework */}
            <View
              className={`p-6 rounded-3xl bg-white border transition-all mb-4 ${
                activeHighlightTarget === "expense_tracker"
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-100 shadow-sm"
              }`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 items-center justify-center">
                  <Text className="text-purple-700 font-bold text-base">
                    📊
                  </Text>
                </View>
                <View className="px-2.5 py-0.5 bg-purple-100 rounded-full">
                  <Text className="text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                    Framework Split
                  </Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-slate-900 mb-1">
                Expense Tracker & Budget
              </Text>
              <Text className="text-sm text-slate-500 leading-normal mb-3">
                Log expenses daily against the 55/5/10/15/15 model or custom
                categories with real-time visual spending gauges.
              </Text>

              {/* Finor multi-segment color distribution preview bar */}
              <View className="p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-xs font-semibold text-slate-600">
                    55 / 5 / 10 / 15 / 15
                  </Text>
                  <Text className="text-xs font-bold text-slate-800">
                    Monthly Plan
                  </Text>
                </View>
                <View className="flex-row h-2 rounded-full overflow-hidden">
                  <View className="w-[55%] bg-emerald-600" />
                  <View className="w-[5%] bg-amber-400" />
                  <View className="w-[10%] bg-blue-500" />
                  <View className="w-[15%] bg-purple-500" />
                  <View className="w-[15%] bg-indigo-600" />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white active:bg-slate-50 items-center justify-center"
              >
                <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Setup Budget Framework
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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

      {/* Guided Walkthrough Tour Overlay */}
      <GuidedWalkthrough
        visible={showWalkthrough}
        onClose={handleCloseTour}
        onStepChange={handleWalkthroughStepChange}
      />
    </SafeAreaView>
  );
}
