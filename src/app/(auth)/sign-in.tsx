import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth";

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithGoogle, devSignIn, user, profile, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // If already authenticated, route accordingly
  React.useEffect(() => {
    if (user) {
      if (profile && !profile.onboarding_completed) {
        router.replace("/(auth)/onboarding");
      } else if (profile && profile.onboarding_completed) {
        router.replace("/(app)/dashboard");
      }
    }
  }, [user, profile, router]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    setSubmitting(false);
    if (error) {
      setAuthError(
        error.message || "Failed to sign in with Google. Please try again.",
      );
    }
  };

  const handleDevSignIn = async () => {
    setAuthError(null);
    setSubmitting(true);
    const { error } = await devSignIn();
    setSubmitting(false);
    if (error) {
      setAuthError(error.message || "Dev sign-in failed.");
    } else {
      router.replace("/(auth)/onboarding");
    }
  };

  const isDev = process.env.EXPO_PUBLIC_APP_ENV === "development";

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-5 py-8 max-w-lg mx-auto w-full justify-between"
      >
        <View>
          {/* Header & Logo */}
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center space-x-2">
              <View className="w-10 h-10 rounded-xl bg-emerald-600 items-center justify-center shadow-sm">
                <Text className="text-white text-lg font-bold">K</Text>
              </View>
              <Text className="text-2xl font-bold text-slate-900 tracking-tight ml-2">
                Kubes
              </Text>
            </View>
            <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
              <Text className="text-emerald-700 text-xs font-semibold tracking-wide uppercase">
                Ghana & Global
              </Text>
            </View>
          </View>

          {/* Hero Card */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
            <View className="self-start px-3 py-1 bg-slate-100 rounded-full mb-4">
              <Text className="text-slate-600 text-xs font-medium">
                Calm Investment Learning
              </Text>
            </View>

            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Master the basics. Build the habit.
            </Text>

            <Text className="text-base text-slate-500 leading-relaxed mb-6">
              A structured, distraction-free guide to the Ghana Stock Exchange,
              US markets, and intentional budgeting. No brokerage, no trades, no
              empty promises.
            </Text>

            {/* Value Props */}
            <View className="space-y-3 mb-8">
              <View className="flex-row items-center space-x-3 mb-2">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Text className="text-emerald-700 font-bold text-xs">✓</Text>
                </View>
                <Text className="text-sm text-slate-700 font-medium">
                  3-step onboarding tailored to your financial goals
                </Text>
              </View>
              <View className="flex-row items-center space-x-3 mb-2">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Text className="text-emerald-700 font-bold text-xs">✓</Text>
                </View>
                <Text className="text-sm text-slate-700 font-medium">
                  Clear, bite-sized lessons designed for everyday life
                </Text>
              </View>
              <View className="flex-row items-center space-x-3">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Text className="text-emerald-700 font-bold text-xs">✓</Text>
                </View>
                <Text className="text-sm text-slate-700 font-medium">
                  90-day savings challenges and expense tracking
                </Text>
              </View>
            </View>

            {/* Error Message */}
            {authError && (
              <View className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                <Text className="text-red-700 text-sm font-medium">
                  {authError}
                </Text>
              </View>
            )}

            {/* Google Sign In Button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={submitting || isLoading}
              activeOpacity={0.85}
              className="w-full py-4 px-5 bg-white border border-slate-300 rounded-2xl flex-row items-center justify-center shadow-sm active:bg-slate-50"
            >
              {submitting ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <View className="flex-row items-center">
                  {/* Google 'G' Symbol */}
                  <View className="w-5 h-5 rounded-full bg-slate-900 items-center justify-center mr-3">
                    <Text className="text-white text-xs font-bold">G</Text>
                  </View>
                  <Text className="text-base font-semibold text-slate-800">
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Dev Quick Sign In */}
            {isDev && (
              <View className="mt-4 pt-4 border-t border-slate-100">
                <TouchableOpacity
                  onPress={handleDevSignIn}
                  disabled={submitting || isLoading}
                  activeOpacity={0.8}
                  className="w-full py-3 px-4 bg-slate-900 rounded-2xl items-center justify-center active:bg-slate-800"
                >
                  <Text className="text-sm font-semibold text-white">
                    Quick Dev Sign-In (Test Explorer)
                  </Text>
                </TouchableOpacity>
                <Text className="text-xs text-slate-500 text-center mt-2">
                  Visible in development mode for instant testability
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Compliance Footer */}
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
