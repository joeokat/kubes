import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth";
import { ONBOARDING_STEPS } from "../../lib/onboarding";

export default function DashboardScreen() {
  const { user, profile, signOut } = useAuth();

  // Map IDs to readable labels
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
        className="flex-1 px-5 py-6 max-w-4xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Header Bar */}
          <View className="flex-row items-center justify-between pb-6 border-b border-slate-200/80 mb-6">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 rounded-2xl bg-emerald-600 items-center justify-center shadow-sm">
                <Text className="text-white text-lg font-bold">K</Text>
              </View>
              <View className="ml-2">
                <Text className="text-xl font-bold text-slate-900 tracking-tight">
                  Kubes
                </Text>
                <Text className="text-xs font-medium text-emerald-700">
                  Universal Education Platform
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={signOut}
              activeOpacity={0.75}
              className="py-2 px-4 rounded-xl border border-slate-200 bg-white shadow-xs active:bg-slate-50"
            >
              <Text className="text-xs font-semibold text-slate-700">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* Welcome Banner Card */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
                <Text className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                  Onboarding Complete
                </Text>
              </View>
              <Text className="text-xs text-slate-500 font-medium">
                {user?.email || "Signed In"}
              </Text>
            </View>

            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Welcome aboard, {profile?.name || "Learner"}
            </Text>

            <Text className="text-base text-slate-500 leading-relaxed mb-6">
              Your profile has been configured based on your 3-step quiz
              preferences. Here is your tailored foundation:
            </Text>

            {/* Profile Overview Pills / Grid */}
            <View className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <View className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Interest Area
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {getLabel("interest_area", profile?.interest_area)}
                </Text>
              </View>

              <View className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Experience Level
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {getLabel("experience_level", profile?.experience_level)}
                </Text>
              </View>

              <View className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Primary Goal
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {getLabel("goal", profile?.goal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Action Tiles Previewing Curriculum & Tools */}
          <Text className="text-lg font-bold text-slate-900 mb-4 px-1">
            Learning Modules
          </Text>

          <View className="space-y-4 mb-8">
            <View className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between mb-3">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-bold text-slate-900 mr-2">
                    Investing 101 Track
                  </Text>
                  <View className="px-2 py-0.5 bg-emerald-100 rounded-md">
                    <Text className="text-[10px] font-bold text-emerald-800 uppercase">
                      Next Up
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-slate-500 leading-normal">
                  Foundations of local GSE stocks, treasury bills, and US equity
                  compounding.
                </Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                <Text className="text-slate-600 font-bold">→</Text>
              </View>
            </View>

            <View className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between mb-3">
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-slate-900 mb-1">
                  Financial Health Meter
                </Text>
                <Text className="text-sm text-slate-500 leading-normal">
                  Self-reported cash flow health assessment and emergency fund
                  calculator.
                </Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                <Text className="text-slate-600 font-bold">→</Text>
              </View>
            </View>

            <View className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-slate-900 mb-1">
                  90-Day Savings Challenge
                </Text>
                <Text className="text-sm text-slate-500 leading-normal">
                  Manual daily check-ins to build consistent compounding habits.
                </Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                <Text className="text-slate-600 font-bold">→</Text>
              </View>
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
    </SafeAreaView>
  );
}
