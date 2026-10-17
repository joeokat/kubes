import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPolicyBySlug } from "../../lib/policies";

export default function PolicyDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const policy = getPolicyBySlug(slug ?? "");

  if (!policy) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-6xl mb-4">📄</Text>
        <Text className="text-xl font-bold text-slate-900 mb-2 text-center">
          Page Not Found
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          We couldn't find the policy document you were looking for.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/policies" as any)}
          className="py-3 px-6 bg-emerald-600 rounded-2xl"
        >
          <Text className="text-white text-sm font-bold">
            View All Policies
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Sticky top bar */}
      <View className="flex-row items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mr-4"
        >
          <Text className="text-slate-500 text-base">← Back</Text>
        </TouchableOpacity>
        <Text
          className="flex-1 text-sm font-bold text-slate-700"
          numberOfLines={1}
        >
          {policy.title}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title block */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-slate-900 mb-1">
            {policy.title}
          </Text>
          <Text className="text-xs text-slate-400">
            Last updated: {policy.lastUpdated}
          </Text>
          <Text className="text-sm text-slate-500 leading-relaxed mt-3">
            {policy.shortDescription}
          </Text>
        </View>

        {/* Sections */}
        <View className="px-6 gap-y-4">
          {policy.sections.map((section, sectionIndex) => (
            <View
              key={sectionIndex}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5"
            >
              <Text className="text-sm font-bold text-slate-800 mb-3">
                {section.heading}
              </Text>
              <View className="gap-y-2">
                {section.content.map((paragraph, pIndex) => (
                  <Text
                    key={pIndex}
                    className="text-sm text-slate-600 leading-relaxed"
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Compliance footer */}
        <View className="px-6 pt-8">
          <View className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
            <Text className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              ⚠️ Educational Platform Only
            </Text>
            <Text className="text-xs text-amber-700 leading-relaxed">
              Kubes is not a registered investment advisor, broker-dealer,
              financial planner, or tax advisor. Nothing on this platform
              constitutes personalized financial, investment, legal, or tax
              advice. All content is for educational purposes only.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
