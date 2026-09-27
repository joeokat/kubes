import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import {
  WALKTHROUGH_STEPS,
  getNextStepIndex,
  getPrevStepIndex,
  isLastStep,
  markWalkthroughCompleted,
} from "../lib/walkthrough";

interface GuidedWalkthroughProps {
  visible: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number, targetId: string) => void;
}

export function GuidedWalkthrough({
  visible,
  onClose,
  onStepChange,
}: GuidedWalkthroughProps) {
  const [stepIndex, setStepIndex] = useState<number>(0);

  if (!visible) return null;

  const currentStep = WALKTHROUGH_STEPS[stepIndex];
  const totalSteps = WALKTHROUGH_STEPS.length;
  const isLast = isLastStep(stepIndex, totalSteps);

  const handleNext = async () => {
    if (isLast) {
      await markWalkthroughCompleted();
      setStepIndex(0);
      onClose();
    } else {
      const nextIdx = getNextStepIndex(stepIndex, totalSteps);
      setStepIndex(nextIdx);
      onStepChange?.(nextIdx, WALKTHROUGH_STEPS[nextIdx].targetId);
    }
  };

  const handlePrev = () => {
    const prevIdx = getPrevStepIndex(stepIndex);
    setStepIndex(prevIdx);
    onStepChange?.(prevIdx, WALKTHROUGH_STEPS[prevIdx].targetId);
  };

  const handleSkip = async () => {
    await markWalkthroughCompleted();
    setStepIndex(0);
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleSkip}
    >
      <View className="flex-1 bg-slate-900/60 justify-center items-center px-4 py-8">
        <View className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl">
          {/* Top Bar: Step Badge & Skip */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full">
              <Text className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
                {currentStep.badge}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.7}
              className="py-1 px-2.5 rounded-lg active:bg-slate-100"
            >
              <Text className="text-xs font-semibold text-slate-500">
                Skip Tour
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title & Description */}
          <Text className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            {currentStep.title}
          </Text>

          <Text className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
            {currentStep.description}
          </Text>

          {/* Context Target Preview Card */}
          <View className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl mb-6 flex-row items-center space-x-3">
            <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center mr-3">
              <Text className="text-emerald-800 font-bold text-sm">
                {currentStep.step}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Focus Area
              </Text>
              <Text className="text-sm font-bold text-slate-900">
                {currentStep.targetId === "curriculum"
                  ? "Investing 101 Track (Free Lesson 1)"
                  : currentStep.targetId === "health_meter"
                  ? "Financial Health Assessment"
                  : currentStep.targetId === "savings_challenge"
                  ? "90-Day Savings Habit & Streak"
                  : "Expense Tracker & Spending Framework"}
              </Text>
            </View>
          </View>

          {/* Segmented Progress Indicator */}
          <View className="flex-row items-center justify-between pt-4 border-t border-slate-100">
            <View className="flex-row items-center space-x-1.5">
              {WALKTHROUGH_STEPS.map((step, idx) => (
                <View
                  key={step.step}
                  className={`h-2 rounded-full mr-1.5 transition-all ${
                    idx === stepIndex
                      ? "w-7 bg-emerald-600"
                      : idx < stepIndex
                      ? "w-2.5 bg-emerald-300"
                      : "w-2.5 bg-slate-200"
                  }`}
                />
              ))}
            </View>

            {/* Navigation Actions */}
            <View className="flex-row items-center space-x-2">
              {stepIndex > 0 && (
                <TouchableOpacity
                  onPress={handlePrev}
                  activeOpacity={0.7}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white mr-2"
                >
                  <Text className="text-xs font-bold text-slate-700">Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.85}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 shadow-sm active:bg-emerald-700"
              >
                <Text className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {isLast ? "Get Started" : "Next Tip →"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
