import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth";
import {
    ONBOARDING_STEPS,
    validateOnboardingSubmission,
} from "../../lib/onboarding";
import { OnboardingData } from "../../types/auth";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, profile, completeOnboarding } = useAuth();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    interest_area: profile?.interest_area || undefined,
    experience_level: profile?.experience_level || undefined,
    goal: profile?.goal || undefined,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const selectedValue = formData[currentStep.fieldName];
  const totalSteps = ONBOARDING_STEPS.length;

  const handleSelectOption = (optionId: string) => {
    setErrorMsg(null);
    setFormData((prev) => ({
      ...prev,
      [currentStep.fieldName]: optionId,
    }));
  };

  const handleNext = async () => {
    if (!selectedValue) {
      setErrorMsg("Please select an option to continue.");
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Final step: validate and submit
      const validation = validateOnboardingSubmission(formData);
      if (!validation.isValid) {
        setErrorMsg("Please ensure all steps are answered before submitting.");
        return;
      }

      setIsSubmitting(true);
      setErrorMsg(null);

      const { error } = await completeOnboarding(formData as OnboardingData);
      setIsSubmitting(false);

      if (error) {
        setErrorMsg(
          error.message || "Failed to save your preferences. Please try again.",
        );
      } else {
        router.replace("/(app)/dashboard");
      }
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-5 py-6 max-w-xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Navigation & Progress */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                Step {currentStep.step} of {totalSteps}
              </Text>
              <Text className="text-xs font-medium text-slate-500">
                {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
                Completed
              </Text>
            </View>

            {/* Segmented Progress Bar */}
            <View className="flex-row space-x-2 h-2">
              {ONBOARDING_STEPS.map((step, idx) => (
                <View
                  key={step.step}
                  className={`flex-1 h-full rounded-full mr-1.5 ${
                    idx <= currentStepIndex ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* Step Header */}
          <View className="mb-6">
            <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {currentStep.title}
            </Text>
            <Text className="text-sm sm:text-base text-slate-500 leading-relaxed">
              {currentStep.subtitle}
            </Text>
          </View>

          {/* Options List */}
          <View className="space-y-3 mb-6">
            {currentStep.options.map((option) => {
              const isSelected = selectedValue === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelectOption(option.id)}
                  activeOpacity={0.8}
                  className={`p-5 rounded-2xl border transition-all mb-3 ${
                    isSelected
                      ? "bg-emerald-50/50 border-emerald-600 shadow-sm"
                      : "bg-white border-slate-200/90 active:border-slate-300"
                  }`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text
                        className={`text-base font-bold mb-1 ${
                          isSelected ? "text-emerald-900" : "text-slate-900"
                        }`}
                      >
                        {option.label}
                      </Text>
                      <Text className="text-sm text-slate-500 leading-normal">
                        {option.description}
                      </Text>
                    </View>

                    {/* Radio indicator */}
                    <View
                      className={`w-6 h-6 rounded-full border items-center justify-center mt-0.5 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <Text className="text-white text-xs font-bold">✓</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Error Message */}
          {errorMsg && (
            <View className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
              <Text className="text-red-700 text-sm font-medium">
                {errorMsg}
              </Text>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View className="pt-4 border-t border-slate-200/70">
          <View className="flex-row items-center space-x-3">
            {currentStepIndex > 0 && (
              <TouchableOpacity
                onPress={handleBack}
                disabled={isSubmitting}
                activeOpacity={0.7}
                className="py-4 px-6 rounded-2xl border border-slate-300 bg-white items-center justify-center mr-3"
              >
                <Text className="text-sm font-semibold text-slate-700">
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={!selectedValue || isSubmitting}
              activeOpacity={0.85}
              className={`flex-1 py-4 px-6 rounded-2xl items-center justify-center ${
                !selectedValue || isSubmitting
                  ? "bg-slate-300"
                  : "bg-emerald-600 active:bg-emerald-700 shadow-sm"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {currentStepIndex === totalSteps - 1
                    ? "Complete Setup"
                    : "Continue"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
