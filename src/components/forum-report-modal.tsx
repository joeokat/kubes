import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/auth";
import { reportForumContent } from "../lib/forum";
import type { ForumReportTarget } from "../types/forum";

interface ForumReportModalProps {
  target: ForumReportTarget | null;
  onClose: () => void;
}

export function ForumReportModal({ target, onClose }: ForumReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!target) {
      setReason("");
      setErrorMessage(null);
      setSubmitted(false);
    }
  }, [target]);

  const handleSubmit = async () => {
    if (!user || !target) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const { error } = await reportForumContent({
      reporterId: user.id,
      target,
      reason,
    });
    if (error) {
      setErrorMessage(
        error.message.toLowerCase().includes("duplicate")
          ? "You have already reported this content."
          : `Report could not be sent: ${error.message}`,
      );
    } else {
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  return (
    <Modal
      visible={Boolean(target)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center px-5 bg-black/40">
        <View className="bg-white rounded-2xl p-5 max-w-lg w-full mx-auto">
          <Text className="text-lg font-bold text-slate-900 mb-2">
            {submitted ? "Report received" : "Report this content"}
          </Text>
          {submitted ? (
            <Text className="text-sm text-slate-600 mb-5">
              Thank you. Your report has been recorded for review.
            </Text>
          ) : (
            <>
              <Text className="text-sm text-slate-600 mb-3">
                Tell us why this {target?.type} should be reviewed.
              </Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Add context (at least 5 characters)"
                multiline
                maxLength={1000}
                textAlignVertical="top"
                className="min-h-28 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 mb-3"
              />
              {errorMessage && (
                <Text className="text-sm text-red-700 mb-3">
                  {errorMessage}
                </Text>
              )}
            </>
          )}
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 mr-2"
            >
              <Text className="text-sm font-semibold text-slate-700">
                {submitted ? "Done" : "Cancel"}
              </Text>
            </TouchableOpacity>
            {!submitted && (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-red-700 min-w-24 items-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    Submit report
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
