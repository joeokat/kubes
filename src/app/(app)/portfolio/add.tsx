import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/auth";
import {
  ASSET_CLASS_COLORS,
  ASSET_CLASS_LABELS,
  addPortfolioHolding,
  validateHoldingInput,
} from "../../../lib/portfolio";
import type { PortfolioAssetClass } from "../../../types/portfolio";
import { PolicyFooter } from "../../../components/policy-footer";

const ASSET_CLASSES: { key: PortfolioAssetClass; label: string; icon: string }[] = [
  { key: "gh_stock", label: ASSET_CLASS_LABELS.gh_stock, icon: "🇬🇭" },
  { key: "us_stock", label: ASSET_CLASS_LABELS.us_stock, icon: "🇺🇸" },
  { key: "fixed_income", label: ASSET_CLASS_LABELS.fixed_income, icon: "📄" },
  { key: "cash_equivalent", label: ASSET_CLASS_LABELS.cash_equivalent, icon: "💵" },
  { key: "commodity", label: ASSET_CLASS_LABELS.commodity, icon: "🪙" },
  { key: "real_estate", label: ASSET_CLASS_LABELS.real_estate, icon: "🏢" },
];

export default function AddHoldingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  const [assetName, setAssetName] = useState("");
  const [assetClass, setAssetClass] = useState<PortfolioAssetClass>("gh_stock");
  const [amountGhs, setAmountGhs] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Authentication Error", "You must be logged in to track holdings.");
      return;
    }

    const parsedAmount = parseFloat(amountGhs.replace(/,/g, "").trim());
    const validationError = validateHoldingInput(assetName, assetClass, parsedAmount);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    const { error } = await addPortfolioHolding(userId, {
      asset_name: assetName.trim(),
      asset_class: assetClass,
      amount_ghs: parsedAmount,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error);
      Alert.alert("Save Failed", error);
      return;
    }

    router.replace("/(app)/portfolio" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-2 flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-2"
            >
              <Text className="text-slate-500 text-sm">← Back</Text>
            </TouchableOpacity>
            <View className="bg-indigo-100 rounded-full px-3 py-1 ml-auto">
              <Text className="text-indigo-700 text-xs font-semibold">
                Self-Reported Entry
              </Text>
            </View>
          </View>

          <View className="px-6 pb-4">
            <Text className="text-2xl font-bold text-slate-900">
              Add Portfolio Holding
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              Log an asset to see your educational diversification breakdown.
            </Text>
          </View>

          {/* Educational notice */}
          <View className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <Text className="text-amber-800 text-xs leading-relaxed">
              ⚠️ Remember: Kubes never connects to any real brokerage, bank, or
              exchange. All entries are purely self-reported for educational
              modelling only.
            </Text>
          </View>

          {/* Form */}
          <View className="mx-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            {errorMessage && (
              <View className="p-3 bg-red-50 border border-red-200 rounded-xl mb-2">
                <Text className="text-red-700 text-xs font-medium">
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Asset Name */}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider">
                Asset Name
              </Text>
              <TextInput
                value={assetName}
                onChangeText={setAssetName}
                placeholder="e.g. Scancom (MTN Ghana), S&P 500 ETF, 91-Day T-Bill"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm"
              />
            </View>

            {/* Asset Class Selector */}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider">
                Asset Class
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ASSET_CLASSES.map((cls) => {
                  const isSelected = assetClass === cls.key;
                  return (
                    <TouchableOpacity
                      key={cls.key}
                      onPress={() => setAssetClass(cls.key)}
                      style={{
                        borderColor: isSelected
                          ? ASSET_CLASS_COLORS[cls.key]
                          : "#E2E8F0",
                        backgroundColor: isSelected ? "#F8FAFC" : "#FFFFFF",
                      }}
                      className={`flex-row items-center px-3 py-2.5 rounded-xl border ${
                        isSelected ? "border-2" : "border"
                      }`}
                    >
                      <Text className="text-base mr-2">{cls.icon}</Text>
                      <Text
                        className={`text-xs font-medium ${
                          isSelected ? "text-slate-900 font-bold" : "text-slate-600"
                        }`}
                      >
                        {cls.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Estimated Value in GHS */}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider">
                Estimated Value (GHS)
              </Text>
              <TextInput
                value={amountGhs}
                onChangeText={setAmountGhs}
                placeholder="e.g. 5000"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm"
              />
            </View>

            {/* Optional Notes */}
            <View className="mb-6">
              <Text className="text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider">
                Notes (Optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Held in personal custody / long-term bucket"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 rounded-2xl py-4 items-center justify-center shadow-sm"
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  Save Holding & View Insights
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <PolicyFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
