import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllPolicies } from "../../lib/policies";

// Icons map keyed by slug
const POLICY_ICONS: Record<string, string> = {
  terms: "📋",
  privacy: "🔒",
  "risk-disclaimer": "⚠️",
  "refund-policy": "↩️",
  "community-guidelines": "🤝",
};

const POLICY_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  terms: { bg: "bg-blue-50", border: "border-blue-100", badge: "bg-blue-100" },
  privacy: { bg: "bg-emerald-50", border: "border-emerald-100", badge: "bg-emerald-100" },
  "risk-disclaimer": { bg: "bg-amber-50", border: "border-amber-100", badge: "bg-amber-100" },
  "refund-policy": { bg: "bg-violet-50", border: "border-violet-100", badge: "bg-violet-100" },
  "community-guidelines": { bg: "bg-slate-50", border: "border-slate-100", badge: "bg-slate-100" },
};

export default function PoliciesIndexScreen() {
  const router = useRouter();
  const policies = getAllPolicies();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <Text className="text-2xl font-bold text-slate-900 mb-1">
            Legal & Policies
          </Text>
          <Text className="text-sm text-slate-500 leading-relaxed">
            Read our terms, privacy practices, and community standards.
          </Text>
        </View>

        {/* Policy cards */}
        <View className="px-6 gap-y-3">
          {policies.map((policy) => {
            const icon = POLICY_ICONS[policy.slug] ?? "📄";
            const colors = POLICY_COLORS[policy.slug] ?? {
              bg: "bg-slate-50",
              border: "border-slate-100",
              badge: "bg-slate-100",
            };

            return (
              <TouchableOpacity
                key={policy.slug}
                onPress={() =>
                  router.push(`/policies/${policy.slug}` as any)
                }
                activeOpacity={0.8}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex-row items-center gap-x-4"
              >
                {/* Icon badge */}
                <View
                  className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.border} border items-center justify-center flex-shrink-0`}
                >
                  <Text className="text-xl">{icon}</Text>
                </View>

                {/* Text */}
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900 mb-0.5">
                    {policy.title}
                  </Text>
                  <Text
                    className="text-xs text-slate-500 leading-relaxed"
                    numberOfLines={2}
                  >
                    {policy.shortDescription}
                  </Text>
                  <Text className="text-[10px] text-slate-400 mt-1.5">
                    Updated {policy.lastUpdated}
                  </Text>
                </View>

                {/* Chevron */}
                <Text className="text-slate-300 text-lg">›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View className="px-6 pt-8">
          <Text className="text-xs text-slate-400 text-center leading-relaxed">
            Kubes is an educational software platform. Nothing on this platform
            constitutes financial, investment, or legal advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
