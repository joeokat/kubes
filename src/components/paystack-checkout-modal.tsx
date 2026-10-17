import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  PaymentPlanType,
  PaymentPriceConfig,
} from "../types/payments";
import {
  getPaymentPriceConfig,
  initiatePaystackCheckout,
  openPaystackHostedCheckout,
  verifyPaymentConfirmation,
  simulateDevPaymentConfirmation,
} from "../lib/payments";
import { useAuth } from "../contexts/auth";

interface PaystackCheckoutModalProps {
  visible: boolean;
  initialPlanType?: PaymentPlanType;
  lessonId?: string;
  lessonTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaystackCheckoutModal({
  visible,
  initialPlanType = "lifetime_premium",
  lessonId,
  lessonTitle,
  onClose,
  onSuccess,
}: PaystackCheckoutModalProps) {
  const { user, refreshProfile } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanType>(initialPlanType);
  const [status, setStatus] = useState<
    "idle" | "launching" | "verifying" | "success" | "error"
  >("idle");
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lifetimeConfig = getPaymentPriceConfig("lifetime_premium");
  const lessonConfig = getPaymentPriceConfig("lesson_unlock");

  const isDev = process.env.EXPO_PUBLIC_APP_ENV === "development";

  const handleStartPayment = async () => {
    if (!user) {
      setErrorMessage("Please sign in to proceed with checkout.");
      return;
    }

    setStatus("launching");
    setErrorMessage(null);

    const initResult = await initiatePaystackCheckout({
      userId: user.id,
      userEmail: user.email || "learner@kubes.app",
      planType: selectedPlan,
      lessonId: selectedPlan === "lesson_unlock" ? lessonId : undefined,
      lessonTitle: selectedPlan === "lesson_unlock" ? lessonTitle : undefined,
    });

    if (!initResult.success || !initResult.reference || !initResult.authorizationUrl) {
      setStatus("error");
      setErrorMessage(initResult.error || "Could not launch checkout session. Please try again.");
      return;
    }

    setActiveReference(initResult.reference);

    // Open Paystack hosted checkout universally
    const openRes = await openPaystackHostedCheckout(initResult.authorizationUrl);
    if (!openRes.opened) {
      setStatus("error");
      setErrorMessage(openRes.error || "Unable to open browser window.");
      return;
    }

    // Await user completing transaction; switch to verification prompt
    setStatus("verifying");
  };

  const handleCheckConfirmation = async () => {
    if (!user || !activeReference) return;

    setStatus("verifying");
    setErrorMessage(null);

    // Strict Golden Rule: Confirm directly from the database before showing complete!
    const verifyRes = await verifyPaymentConfirmation(user.id, activeReference, 6, 1200);

    if (verifyRes.confirmed) {
      await refreshProfile();
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(
        verifyRes.error ||
          "Payment confirmation not found in database. If you completed payment, tap Check Again or try dev confirmation."
      );
    }
  };

  const handleDevSimulate = async () => {
    if (!user) return;
    setStatus("verifying");
    const ref = activeReference || `kubes_dev_${Date.now()}`;
    setActiveReference(ref);

    const simRes = await simulateDevPaymentConfirmation(
      user.id,
      ref,
      selectedPlan,
      lessonId
    );

    if (simRes.success) {
      await refreshProfile();
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(simRes.error || "Simulation failed.");
    }
  };

  const handleFinishSuccess = () => {
    setStatus("idle");
    onSuccess();
    onClose();
  };

  const handleModalClose = () => {
    if (status === "verifying") {
      // Allow user to dismiss verifying screen
      setStatus("idle");
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-4">
        <View className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <View className="flex-row items-center space-x-2">
              <View className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center mr-2">
                <Text className="text-emerald-700 font-bold text-sm">💳</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-slate-900">
                  {status === "success" ? "Access Granted!" : "Unlock Educational Content"}
                </Text>
                <Text className="text-[11px] text-slate-400 font-medium">
                  Verified via Paystack (Cards & Mobile Money)
                </Text>
              </View>
            </View>

            {status !== "launching" && (
              <TouchableOpacity
                onPress={handleModalClose}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Text className="text-slate-500 font-bold text-sm">✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* State 1: Success Confirmed */}
          {status === "success" ? (
            <View className="items-center py-6">
              <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4 border border-emerald-200">
                <Text className="text-emerald-700 text-3xl font-bold">✓</Text>
              </View>

              <Text className="text-xl font-extrabold text-slate-900 mb-2 text-center">
                Payment Confirmed
              </Text>
              <Text className="text-sm text-slate-600 text-center leading-relaxed mb-6 max-w-xs">
                {selectedPlan === "lifetime_premium"
                  ? "You now have unlimited Lifetime Premium access to all lessons, quizzes, and market insights!"
                  : `Lesson "${lessonTitle || "Selected Lesson"}" has been permanently unlocked.`}
              </Text>

              <TouchableOpacity
                onPress={handleFinishSuccess}
                activeOpacity={0.85}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-xs"
              >
                <Text className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Continue Learning →
                </Text>
              </TouchableOpacity>
            </View>
          ) : status === "verifying" ? (
            /* State 2: Verifying database confirmation */
            <View className="items-center py-6">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-base font-bold text-slate-900 mt-4 mb-2 text-center">
                Verifying Payment Confirmation
              </Text>
              <Text className="text-xs text-slate-500 text-center mb-6 leading-relaxed max-w-xs">
                We are waiting for the server-side database webhook to confirm your transaction. No entry unlocks until verified.
              </Text>

              <TouchableOpacity
                onPress={handleCheckConfirmation}
                activeOpacity={0.8}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 items-center justify-center mb-3"
              >
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  Check Database Status Again 🔄
                </Text>
              </TouchableOpacity>

              {isDev && (
                <TouchableOpacity
                  onPress={handleDevSimulate}
                  className="py-2 px-4 rounded-xl border border-amber-300 bg-amber-50"
                >
                  <Text className="text-xs font-bold text-amber-900">
                    🛠️ Dev: Confirm Webhook Instantly
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* State 3: Plan selection and checkout form */
            <ScrollView showsVerticalScrollIndicator={false}>
              {lessonId && (
                <View className="mb-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Choose an Option:
                  </Text>

                  {/* Option A: Single Lesson Unlock */}
                  <TouchableOpacity
                    onPress={() => setSelectedPlan("lesson_unlock")}
                    activeOpacity={0.85}
                    className={`p-4 rounded-2xl border mb-3 transition-all ${
                      selectedPlan === "lesson_unlock"
                        ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm font-bold text-slate-900">
                        Unlock Single Lesson
                      </Text>
                      <View className="px-2.5 py-0.5 rounded-full bg-slate-100">
                        <Text className="text-xs font-extrabold text-slate-800">
                          {lessonConfig.displayPrice}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-slate-500 leading-relaxed">
                      Unlock reading material and quiz for "{lessonTitle || "this lesson"}".
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Option B: Lifetime Premium (Recommended) */}
              <TouchableOpacity
                onPress={() => setSelectedPlan("lifetime_premium")}
                activeOpacity={0.85}
                className={`p-4 rounded-2xl border mb-4 transition-all ${
                  selectedPlan === "lifetime_premium"
                    ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center space-x-1.5">
                    <Text className="text-sm font-bold text-slate-900">
                      Lifetime Premium Access
                    </Text>
                    <View className="ml-2 px-2 py-0.5 bg-emerald-600 rounded-full">
                      <Text className="text-[9px] font-bold text-white uppercase tracking-wider">
                        Best Value
                      </Text>
                    </View>
                  </View>
                  <View className="px-2.5 py-0.5 rounded-full bg-emerald-100">
                    <Text className="text-xs font-extrabold text-emerald-800">
                      {lifetimeConfig.displayPrice}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500 leading-relaxed">
                  One-time payment. All 7 lessons, future curriculum modules, and exclusive market insights unlocked forever.
                </Text>
              </TouchableOpacity>

              {/* Error Warning */}
              {errorMessage && (
                <View className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <Text className="text-xs font-medium text-red-700">
                    {errorMessage}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <TouchableOpacity
                onPress={handleStartPayment}
                disabled={status === "launching"}
                activeOpacity={0.85}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-xs mb-3"
              >
                {status === "launching" ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Proceed to Paystack ({selectedPlan === "lifetime_premium" ? "$20" : "GH₵0.50"}) →
                  </Text>
                )}
              </TouchableOpacity>

              {isDev && (
                <TouchableOpacity
                  onPress={handleDevSimulate}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 items-center justify-center mb-2"
                >
                  <Text className="text-[11px] font-bold text-amber-900">
                    🛠️ Dev Test: Simulate Webhook Unlock
                  </Text>
                </TouchableOpacity>
              )}

              {/* Non-Advisory Compliance Notice */}
              <Text className="text-[10px] text-slate-400 text-center leading-normal mt-2">
                Payments are securely processed via Paystack. Educational materials only; never financial or trading advice.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

