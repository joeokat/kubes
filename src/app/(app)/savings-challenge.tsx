import { useRouter } from "expo-router";
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
import { useAuth } from "../../contexts/auth";
import {
  calculateSavingsChallengeProgress,
  createSavingsChallenge,
  createSavingsCheckIn,
  fetchActiveSavingsChallenge,
  validateSavingsChallenge,
} from "../../lib/savings-challenge";
import type {
  SavingsChallenge,
  SavingsCheckIn,
  SavingsFrequency,
} from "../../types/savings-challenge";

const FREQUENCIES: { value: SavingsFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function SavingsChallengeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<SavingsChallenge | null>(null);
  const [checkIns, setCheckIns] = useState<SavingsCheckIn[]>([]);
  const [targetAmount, setTargetAmount] = useState("");
  const [frequency, setFrequency] = useState<SavingsFrequency>("weekly");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadChallenge = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage(null);
    const result = await fetchActiveSavingsChallenge(user.id);
    setChallenge(result.challenge);
    setCheckIns(result.checkIns);
    setErrorMessage(result.error?.message ?? null);
    setLoading(false);
  };

  useEffect(() => {
    void loadChallenge();
  }, [user]);

  const handleCreateChallenge = async () => {
    if (!user) return;
    const amount = Number(targetAmount);
    const validationError = validateSavingsChallenge(amount, vehicleLabel);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    const result = await createSavingsChallenge({
      userId: user.id,
      targetAmount: amount,
      frequency,
      vehicleLabel,
    });
    if (result.error) {
      setErrorMessage(
        `Could not create the challenge: ${result.error.message}`,
      );
    } else if (result.data) {
      setChallenge(result.data);
      setCheckIns([]);
    }
    setIsSaving(false);
  };

  const handleCheckIn = async () => {
    if (!user || !challenge) return;
    const amount = Number(contributionAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("Enter a contribution greater than zero.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    const result = await createSavingsCheckIn({
      userId: user.id,
      challengeId: challenge.id,
      amount,
    });
    if (result.error) {
      setErrorMessage(`Could not save the check-in: ${result.error.message}`);
    } else if (result.data) {
      setCheckIns((previous) => [result.data!, ...previous]);
      setContributionAmount("");
    }
    setIsSaving(false);
  };

  const startNewChallenge = () => {
    setChallenge(null);
    setCheckIns([]);
    setErrorMessage(null);
    setTargetAmount("");
    setVehicleLabel("");
  };

  const progress = challenge
    ? calculateSavingsChallengeProgress(challenge, checkIns)
    : null;
  const showLoadError = Boolean(
    errorMessage && !challenge && loading === false,
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full"
      >
        <View>
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => router.replace("/(app)/dashboard" as any)}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">
                ← Dashboard
              </Text>
            </TouchableOpacity>
            <View className="px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
              <Text className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                90-Day Challenge
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-extrabold text-slate-900 mb-1">
            Build a savings habit
          </Text>
          <Text className="text-sm text-slate-500 leading-relaxed mb-6">
            Choose your own amount, schedule, and savings label. Contributions
            are self-reported; Kubes does not move or invest money.
          </Text>

          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-sm text-slate-500 mt-4">
                Loading your challenge...
              </Text>
            </View>
          ) : showLoadError ? (
            <View className="bg-white rounded-2xl p-6 border border-slate-200">
              <Text className="text-sm text-red-700 mb-4">{errorMessage}</Text>
              <TouchableOpacity
                onPress={loadChallenge}
                className="py-3 px-4 rounded-xl bg-emerald-700 items-center"
              >
                <Text className="text-sm font-bold text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : challenge && progress ? (
            <View>
              <View className="bg-white rounded-2xl p-5 border border-slate-200 mb-4">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                      {progress.isComplete
                        ? "Challenge complete"
                        : `Day ${progress.day} of 90`}
                    </Text>
                    <Text className="text-lg font-bold text-slate-900">
                      {challenge.vehicle_label}
                    </Text>
                    <Text className="text-sm text-slate-500 mt-1">
                      GH₵{Number(challenge.target_amount).toLocaleString()}{" "}
                      {challenge.frequency}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-extrabold text-emerald-800">
                      {progress.streak}
                    </Text>
                    <Text className="text-xs text-slate-500">
                      period streak
                    </Text>
                  </View>
                </View>

                <View className="h-3 rounded-full bg-slate-100 overflow-hidden mb-2">
                  <View
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${progress.percentageComplete}%` }}
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-semibold text-slate-700">
                    GH₵{progress.totalSaved.toLocaleString()} saved
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {progress.percentageComplete}% of GH₵
                    {progress.goalAmount.toLocaleString()}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 mt-3">
                  {progress.isComplete
                    ? "Your 90-day period has ended. Your contribution history remains available."
                    : `${progress.daysRemaining} days remaining`}
                </Text>
              </View>

              {!progress.isComplete ? (
                <View className="bg-white rounded-2xl p-5 border border-slate-200 mb-4">
                  <Text className="text-base font-bold text-slate-900 mb-1">
                    Log a contribution
                  </Text>
                  <Text className="text-xs text-slate-500 mb-4">
                    Record a contribution you made outside the app.
                  </Text>
                  <View className="flex-row items-center px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 mb-3">
                    <Text className="text-sm font-bold text-slate-500 mr-2">
                      GH₵
                    </Text>
                    <TextInput
                      value={contributionAmount}
                      onChangeText={setContributionAmount}
                      placeholder="Amount"
                      keyboardType="decimal-pad"
                      className="flex-1 text-base font-semibold text-slate-900"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleCheckIn}
                    disabled={isSaving}
                    className="py-3.5 rounded-xl bg-emerald-700 items-center"
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-sm font-bold text-white">
                        Save check-in
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={startNewChallenge}
                  className="py-3.5 rounded-xl bg-emerald-700 items-center mb-4"
                >
                  <Text className="text-sm font-bold text-white">
                    Start a new challenge
                  </Text>
                </TouchableOpacity>
              )}

              <View className="bg-white rounded-2xl p-5 border border-slate-200">
                <Text className="text-base font-bold text-slate-900 mb-3">
                  Contribution history
                </Text>
                {checkIns.length === 0 ? (
                  <Text className="text-sm text-slate-500">
                    Your confirmed check-ins will appear here.
                  </Text>
                ) : (
                  checkIns.slice(0, 10).map((checkIn) => (
                    <View
                      key={checkIn.id}
                      className="flex-row justify-between py-2 border-b border-slate-100"
                    >
                      <Text className="text-sm text-slate-600">
                        {new Date(checkIn.logged_at).toLocaleDateString()}
                      </Text>
                      <Text className="text-sm font-semibold text-slate-900">
                        GH₵{Number(checkIn.amount).toLocaleString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-5 border border-slate-200">
              <Text className="text-lg font-bold text-slate-900 mb-1">
                Set your personal target
              </Text>
              <Text className="text-sm text-slate-500 mb-5">
                Your target is the amount you plan to save each period.
              </Text>

              <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                Amount per period
              </Text>
              <View className="flex-row items-center px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 mb-4">
                <Text className="text-sm font-bold text-slate-500 mr-2">
                  GH₵
                </Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="e.g. 50"
                  keyboardType="decimal-pad"
                  className="flex-1 text-base font-semibold text-slate-900"
                />
              </View>

              <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                Frequency
              </Text>
              <View className="flex-row mb-4">
                {FREQUENCIES.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setFrequency(option.value)}
                    className={`flex-1 py-3 border rounded-xl items-center mr-2 ${
                      frequency === option.value
                        ? "bg-emerald-50 border-emerald-600"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        frequency === option.value
                          ? "text-emerald-800"
                          : "text-slate-600"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                Savings vehicle label
              </Text>
              <TextInput
                value={vehicleLabel}
                onChangeText={setVehicleLabel}
                placeholder="e.g. Savings account"
                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 mb-4"
              />

              <TouchableOpacity
                onPress={handleCreateChallenge}
                disabled={isSaving}
                className="py-3.5 rounded-xl bg-emerald-700 items-center"
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white">
                    Begin 90-day challenge
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {errorMessage && !showLoadError && (
            <View className="p-3 bg-red-50 border border-red-200 rounded-xl mt-4">
              <Text className="text-sm text-red-700">{errorMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
