import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/auth";
import { createForumThread, FORUM_CATEGORIES } from "../../../lib/forum";
import type { ForumCategory } from "../../../types/forum";

export default function NewForumThreadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ForumCategory>("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await createForumThread({
      userId: user.id,
      title,
      category,
    });
    if (result.error) {
      setErrorMessage(
        `Discussion could not be created: ${result.error.message}`,
      );
    } else if (result.data) {
      router.replace(`/(app)/forum/${result.data.id}` as any);
    }
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        <View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="self-start py-2 px-3 rounded-xl border border-slate-200 bg-white mb-6"
          >
            <Text className="text-xs font-bold text-slate-700">← Forum</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-extrabold text-slate-900 mb-1">
            Start a discussion
          </Text>
          <Text className="text-sm text-slate-500 mb-6">
            Keep your topic educational and avoid personal financial advice.
          </Text>

          <View className="bg-white rounded-2xl border border-slate-200 p-5">
            <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
              Topic
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What would you like to discuss?"
              maxLength={120}
              className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 mb-5"
            />

            <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap mb-5">
              {FORUM_CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategory(item)}
                  className={`px-3.5 py-2.5 rounded-xl border mr-2 mb-2 ${
                    category === item
                      ? "bg-emerald-50 border-emerald-600"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${category === item ? "text-emerald-800" : "text-slate-700"}`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {errorMessage && (
              <View className="p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                <Text className="text-sm text-red-700">{errorMessage}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="py-3.5 rounded-xl bg-emerald-700 items-center"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-sm font-bold text-white">
                  Publish discussion
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
