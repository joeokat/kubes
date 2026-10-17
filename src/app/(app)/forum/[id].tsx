import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ForumReportModal } from "../../../components/forum-report-modal";
import { useAuth } from "../../../contexts/auth";
import { createForumReply, fetchForumThread } from "../../../lib/forum";
import type {
  ForumReply,
  ForumReportTarget,
  ForumThread,
} from "../../../types/forum";

export default function ForumThreadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [reportTarget, setReportTarget] = useState<ForumReportTarget | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadThread = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage(null);
    const result = await fetchForumThread(id);
    setThread(result.thread);
    setReplies(result.replies);
    setErrorMessage(result.error?.message ?? null);
    setLoading(false);
  };

  useEffect(() => {
    void loadThread();
  }, [id]);

  const handleReply = async () => {
    if (!user || !id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await createForumReply({
      userId: user.id,
      threadId: id,
      body: replyText,
    });
    if (result.error) {
      setErrorMessage(`Reply could not be posted: ${result.error.message}`);
    } else if (result.data) {
      setReplies((previous) => [...previous, result.data!]);
      setReplyText("");
    }
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full"
      >
        <View>
          <TouchableOpacity
            onPress={() => router.replace("/(app)/forum" as any)}
            className="self-start py-2 px-3 rounded-xl border border-slate-200 bg-white mb-6"
          >
            <Text className="text-xs font-bold text-slate-700">← Forum</Text>
          </TouchableOpacity>

          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-sm text-slate-500 mt-4">
                Loading discussion...
              </Text>
            </View>
          ) : errorMessage && !thread ? (
            <View className="bg-white rounded-2xl border border-slate-200 p-5">
              <Text className="text-sm text-red-700 mb-4">{errorMessage}</Text>
              <TouchableOpacity
                onPress={loadThread}
                className="self-start px-4 py-2.5 rounded-xl bg-emerald-700"
              >
                <Text className="text-sm font-bold text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !thread ? (
            <Text className="text-sm text-slate-600">
              Discussion not found.
            </Text>
          ) : (
            <>
              <View className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
                <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  {thread.category}
                </Text>
                <Text className="text-xl font-extrabold text-slate-900 mb-2">
                  {thread.title}
                </Text>
                <Text className="text-xs text-slate-500">
                  Community member ·{" "}
                  {new Date(thread.created_at).toLocaleString()}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setReportTarget({ type: "thread", id: thread.id })
                  }
                  className="self-start mt-4 py-1.5 px-2"
                >
                  <Text className="text-xs font-semibold text-red-700">
                    Report discussion
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-base font-bold text-slate-900 mb-3">
                Replies ({replies.length})
              </Text>
              {replies.length === 0 ? (
                <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                  <Text className="text-sm text-slate-500">
                    No replies yet.
                  </Text>
                </View>
              ) : (
                replies.map((reply) => (
                  <View
                    key={reply.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 mb-3"
                  >
                    <Text className="text-sm text-slate-800 leading-relaxed">
                      {reply.body}
                    </Text>
                    <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-slate-100">
                      <Text className="text-xs text-slate-500">
                        Community member ·{" "}
                        {new Date(reply.created_at).toLocaleString()}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setReportTarget({ type: "reply", id: reply.id })
                        }
                        className="py-1 px-2"
                      >
                        <Text className="text-xs font-semibold text-red-700">
                          Report
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <View className="bg-white rounded-2xl border border-slate-200 p-5 mt-2">
                <Text className="text-base font-bold text-slate-900 mb-3">
                  Add a reply
                </Text>
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Share a helpful, respectful response"
                  maxLength={5000}
                  multiline
                  textAlignVertical="top"
                  className="min-h-28 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 mb-3"
                />
                {errorMessage && (
                  <Text className="text-sm text-red-700 mb-3">
                    {errorMessage}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={handleReply}
                  disabled={isSubmitting}
                  className="py-3.5 rounded-xl bg-emerald-700 items-center"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-sm font-bold text-white">
                      Post reply
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
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
