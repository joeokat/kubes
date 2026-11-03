import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import {
  RISK_QUIZ_QUESTIONS,
  evaluateRiskToleranceScore,
  saveRiskToleranceResponse,
} from "../../../lib/risk-tolerance";
import { PolicyFooter } from "../../../components/policy-footer";

export default function RiskQuizScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const userId = user?.id || "demo-user";
  const totalQuestions = RISK_QUIZ_QUESTIONS.length;
  const currentQuestion = RISK_QUIZ_QUESTIONS[currentStep];
  const selectedOptionPoints = answers[currentQuestion.id];

  const handleSelectOption = (points: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: points,
    }));
    setErrorMsg(null);
  };

  const handleNext = async () => {
    if (!selectedOptionPoints) {
      setErrorMsg("Please choose an option to continue.");
      return;
    }

    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submission
      setSubmitting(true);
      setErrorMsg(null);

      try {
        const evaluation = evaluateRiskToleranceScore(answers);
        await saveRiskToleranceResponse(userId, answers, evaluation);
        router.replace("/(app)/risk-tolerance" as any);
      } catch (err) {
        setErrorMsg("Failed to save results. Please try again.");
        setSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrorMsg(null);
    }
  };

  const progressPercent = Math.round(((currentStep + 1) / totalQuestions) * 100);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Bar Navigation */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => router.replace("/(app)/risk-tolerance" as any)}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">✕ Cancel</Text>
            </TouchableOpacity>

            <View className="px-3 py-1 rounded-full bg-slate-100">
              <Text className="text-xs font-bold text-slate-700">
                Question {currentStep + 1} of {totalQuestions}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-6">
            <View className="h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
              <View
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[11px] font-semibold text-slate-400">
                {currentQuestion.title}
              </Text>
              <Text className="text-[11px] font-bold text-emerald-800">
                {progressPercent}% completed
              </Text>
            </View>
          </View>

          {/* Question Card */}
          <View className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm mb-6">
            <Text className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug mb-3">
              {currentQuestion.prompt}
            </Text>

            <View className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
              <Text className="text-xs text-slate-600 leading-relaxed">
                💡 <Text className="font-semibold text-slate-700">Why this matters:</Text>{" "}
                {currentQuestion.contextNote}
              </Text>
            </View>

            {/* Options List */}
            <View className="gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionPoints === option.points;

                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleSelectOption(option.points)}
                    activeOpacity={0.8}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200 active:bg-slate-50"
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`text-sm font-bold mb-0.5 ${
                            isSelected ? "text-emerald-950" : "text-slate-800"
                          }`}
                        >
                          {option.label}
                        </Text>
                        <Text
                          className={`text-xs leading-relaxed ${
                            isSelected ? "text-emerald-800/90" : "text-slate-500"
                          }`}
                        >
                          {option.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errorMsg && (
              <Text className="text-xs font-bold text-rose-600 text-center mt-4">
                {errorMsg}
              </Text>
            )}

            {/* Stepper Buttons */}
            <View className="flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
              <TouchableOpacity
                onPress={handlePrev}
                disabled={currentStep === 0 || submitting}
                activeOpacity={0.7}
                className={`py-3 px-5 rounded-xl border border-slate-200 items-center justify-center ${
                  currentStep === 0 ? "opacity-30" : "bg-white"
                }`}
              >
                <Text className="text-xs font-bold text-slate-700">← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                disabled={submitting}
                activeOpacity={0.85}
                className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    {currentStep === totalQuestions - 1
                      ? "Submit Assessment ✓"
                      : "Next Question →"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Global Policy Footer */}
        <PolicyFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

