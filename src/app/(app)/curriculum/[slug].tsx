import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
    getAllLessons,
    getLessonBySlug,
    gradeQuiz,
    saveLessonProgress,
} from "../../../lib/curriculum";
import { QuizResult } from "../../../types/curriculum";

export default function LessonDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const lesson = getLessonBySlug(slug || "");
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FB] items-center justify-center p-6">
        <Text className="text-lg font-bold text-slate-900 mb-2">
          Lesson Not Found
        </Text>
        <Text className="text-sm text-slate-500 mb-4 text-center">
          The requested lesson does not exist or may have been moved.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(app)/curriculum" as any)}
          className="py-2.5 px-4 bg-emerald-600 rounded-xl"
        >
          <Text className="text-xs font-bold text-white uppercase">
            Return to Curriculum
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (quizResult?.passed) return; // Prevent tampering after pass
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const allQuestionsAnswered = lesson.quiz.every(
    (q) => userAnswers[q.id] !== undefined,
  );

  const handleSubmitQuiz = async () => {
    if (!allQuestionsAnswered) return;
    setIsSubmitting(true);
    setSaveError(null);

    const result = gradeQuiz(lesson, userAnswers);
    setQuizResult(result);

    if (result.passed && user) {
      const { error } = await saveLessonProgress(
        user.id,
        lesson.id,
        result.score,
      );
      if (error) {
        setSaveError(
          "Could not record progress to database. Local progress saved.",
        );
      }
    }

    setIsSubmitting(false);
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setQuizResult(null);
    setSaveError(null);
  };

  const allLessons = getAllLessons();
  const nextLesson = allLessons.find(
    (l) => l.order_index === lesson.order_index + 1,
  );

  const handleNextLesson = () => {
    if (nextLesson) {
      router.replace(`/(app)/curriculum/${nextLesson.slug}` as any);
    } else {
      router.replace("/(app)/curriculum" as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Bar Navigation */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => router.replace("/(app)/curriculum" as any)}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">
                ← All Lessons
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center space-x-2">
              <View className="px-3 py-1 bg-slate-100 rounded-full mr-2">
                <Text className="text-xs font-semibold text-slate-600">
                  {lesson.read_time_mins} min read
                </Text>
              </View>
              <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
                <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Lesson {lesson.order_index} of {allLessons.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Lesson Header Card */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
            <View className="self-start px-3 py-1 bg-slate-100 rounded-full mb-3">
              <Text className="text-slate-600 text-xs font-medium">
                {lesson.category}
              </Text>
            </View>

            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              {lesson.title}
            </Text>

            {/* Structured Content Paragraphs */}
            <View className="space-y-4">
              {lesson.content.map((paragraph, idx) => (
                <Text
                  key={idx}
                  className="text-base text-slate-700 leading-relaxed mb-4"
                >
                  {paragraph}
                </Text>
              ))}
            </View>

            {/* Special Callout (Contextualized for Ghana if applicable) */}
            {lesson.callout && (
              <View
                className={`p-5 rounded-2xl border mt-4 ${
                  lesson.callout.isGhanaSpecific
                    ? "bg-amber-50/60 border-amber-200"
                    : "bg-emerald-50/50 border-emerald-200"
                }`}
              >
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-700 mr-2">
                    💡 {lesson.callout.title}
                  </Text>
                </View>
                <Text className="text-sm text-slate-700 leading-relaxed">
                  {lesson.callout.body}
                </Text>
              </View>
            )}
          </View>

          {/* End of Lesson 3-Question Quiz */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-8">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-slate-900">
                Lesson Quiz
              </Text>
              <View className="px-2.5 py-0.5 bg-emerald-100 rounded-full">
                <Text className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  3 Questions
                </Text>
              </View>
            </View>

            <Text className="text-sm text-slate-500 mb-6">
              Score at least 2 out of 3 correct to complete this lesson and
              unlock the next module.
            </Text>

            {/* Questions List */}
            {lesson.quiz.map((q, qIndex) => {
              const selectedOption = userAnswers[q.id];
              const resultDetail = quizResult?.details.find(
                (d) => d.questionId === q.id,
              );

              return (
                <View
                  key={q.id}
                  className="mb-6 pb-6 border-b border-slate-100 last:border-b-0"
                >
                  <Text className="text-base font-bold text-slate-900 mb-3">
                    {qIndex + 1}. {q.question}
                  </Text>

                  <View className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      const isCorrect = q.correctOptionId === opt.id;
                      const showResult = quizResult !== null;

                      let borderClass = "border-slate-200 bg-white";
                      if (showResult) {
                        if (isCorrect) {
                          borderClass = "border-emerald-500 bg-emerald-50/60";
                        } else if (isSelected && !isCorrect) {
                          borderClass = "border-red-400 bg-red-50/60";
                        }
                      } else if (isSelected) {
                        borderClass = "border-emerald-600 bg-emerald-50/50";
                      }

                      return (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => handleSelectOption(q.id, opt.id)}
                          activeOpacity={0.8}
                          disabled={quizResult?.passed}
                          className={`p-4 rounded-2xl border transition-all mb-2.5 ${borderClass}`}
                        >
                          <View className="flex-row items-center justify-between">
                            <Text
                              className={`text-sm flex-1 pr-2 ${
                                isSelected
                                  ? "font-bold text-slate-900"
                                  : "text-slate-700"
                              }`}
                            >
                              {opt.text}
                            </Text>

                            <View
                              className={`w-5 h-5 rounded-full border items-center justify-center ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-600"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <Text className="text-white text-[10px] font-bold">
                                  ✓
                                </Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Question Explanation if graded */}
                  {resultDetail && (
                    <View
                      className={`p-3 rounded-xl mt-2 ${
                        resultDetail.isCorrect
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold mb-1 ${
                          resultDetail.isCorrect
                            ? "text-emerald-800"
                            : "text-red-800"
                        }`}
                      >
                        {resultDetail.isCorrect ? "Correct!" : "Incorrect"}
                      </Text>
                      <Text className="text-xs text-slate-600 leading-normal">
                        {resultDetail.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Quiz Outcome Banner */}
            {quizResult && (
              <View
                className={`p-5 rounded-2xl border mb-6 ${
                  quizResult.passed
                    ? "bg-emerald-50 border-emerald-300"
                    : "bg-amber-50 border-amber-300"
                }`}
              >
                <Text
                  className={`text-lg font-bold mb-1 ${
                    quizResult.passed ? "text-emerald-900" : "text-amber-900"
                  }`}
                >
                  {quizResult.passed
                    ? "Quiz Passed! 🎉"
                    : "Passing Score Not Met"}
                </Text>
                <Text className="text-sm text-slate-700 mb-3">
                  You scored {quizResult.score} out of{" "}
                  {quizResult.totalQuestions} ({quizResult.percentage}%).
                  {quizResult.passed
                    ? " Your progress has been saved."
                    : " Review the explanations above and try again to unlock the next lesson."}
                </Text>

                {saveError && (
                  <Text className="text-xs text-amber-700 mt-1">
                    {saveError}
                  </Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            {!quizResult ? (
              <TouchableOpacity
                onPress={handleSubmitQuiz}
                disabled={!allQuestionsAnswered || isSubmitting}
                activeOpacity={0.85}
                className={`w-full py-4 rounded-2xl items-center justify-center shadow-sm ${
                  !allQuestionsAnswered || isSubmitting
                    ? "bg-slate-300"
                    : "bg-emerald-600 active:bg-emerald-700"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white uppercase tracking-wider">
                    Submit Answers
                  </Text>
                )}
              </TouchableOpacity>
            ) : quizResult.passed ? (
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity
                  onPress={() => router.replace("/(app)/curriculum" as any)}
                  className="flex-1 py-4 rounded-2xl border border-slate-300 bg-white items-center justify-center mr-2"
                >
                  <Text className="text-xs font-bold text-slate-700 uppercase">
                    All Lessons
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNextLesson}
                  className="flex-1 py-4 rounded-2xl bg-emerald-600 items-center justify-center shadow-sm"
                >
                  <Text className="text-xs font-bold text-white uppercase tracking-wider">
                    {nextLesson ? "Next Lesson →" : "Course Complete! 🏆"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleRetakeQuiz}
                className="w-full py-4 rounded-2xl bg-slate-900 items-center justify-center shadow-sm"
              >
                <Text className="text-sm font-bold text-white uppercase tracking-wider">
                  Retake Quiz
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Compliance Disclaimer per SOP §7 */}
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
