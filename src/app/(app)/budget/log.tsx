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
import { useAuth } from "../../../contexts/auth";
import { fetchActiveFramework, logExpense } from "../../../lib/budget";
import { BudgetCategory, BudgetFramework } from "../../../types/budget";

export default function LogExpenseScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [framework, setFramework] = useState<BudgetFramework | null>(null);
  const [amountStr, setAmountStr] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [spentAt, setSpentAt] = useState<string>(
    new Date().toISOString().substring(0, 10),
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchActiveFramework(user.id).then((fw) => {
        setFramework(fw);
        if (fw.categories.length > 0) {
          setSelectedCategory(fw.categories[0].label);
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid expense amount greater than 0.");
      return;
    }
    if (!selectedCategory) {
      setErrorMessage("Please select a category for this expense.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await logExpense({
      user_id: user.id,
      amount: parsedAmount,
      category_label: selectedCategory,
      note: note.trim() || null,
      spent_at: spentAt,
    });

    if (error) {
      setErrorMessage("Failed to record expense to database: " + error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.replace("/(app)/budget" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-4 sm:px-6 py-6 max-w-xl mx-auto w-full justify-between"
      >
        <View>
          {/* Top Bar Navigation */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <TouchableOpacity
              onPress={() => router.replace("/(app)/budget" as any)}
              activeOpacity={0.7}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <Text className="text-xs font-bold text-slate-700">← Back</Text>
            </TouchableOpacity>

            <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
              <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Log Expense
              </Text>
            </View>
          </View>

          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
              <Text className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Record an Expense
              </Text>
              <Text className="text-sm text-slate-500 mb-6">
                Log cash outflows as they occur to keep your budget gauges
                accurate.
              </Text>

              {/* Amount Entry */}
              <View className="mb-5">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Amount ($)
                </Text>
                <View className="flex-row items-center px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <Text className="text-lg font-bold text-slate-400 mr-2">
                    $
                  </Text>
                  <TextInput
                    value={amountStr}
                    onChangeText={setAmountStr}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    className="flex-1 text-xl font-bold text-slate-900"
                  />
                </View>
              </View>

              {/* Category Picker Chips */}
              <View className="mb-5">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category
                </Text>
                <View className="space-y-2">
                  {framework?.categories.map((cat: BudgetCategory) => {
                    const isSelected = selectedCategory === cat.label;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCategory(cat.label)}
                        activeOpacity={0.8}
                        className={`p-3.5 rounded-2xl border transition-all mb-2 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center space-x-2">
                            <Text className="text-base mr-2">{cat.icon}</Text>
                            <Text
                              className={`text-sm font-bold ${
                                isSelected
                                  ? "text-emerald-900"
                                  : "text-slate-800"
                              }`}
                            >
                              {cat.label}
                            </Text>
                          </View>

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
              </View>

              {/* Note / Description */}
              <View className="mb-5">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description / Note (Optional)
                </Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="e.g. Groceries at market, Fuel, Internet bill"
                  placeholderTextColor="#94A3B8"
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900"
                />
              </View>

              {/* Date */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Date (YYYY-MM-DD)
                </Text>
                <TextInput
                  value={spentAt}
                  onChangeText={setSpentAt}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900"
                />
              </View>

              {errorMessage && (
                <View className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <Text className="text-xs text-red-700">{errorMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center shadow-sm"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white uppercase tracking-wider">
                    Confirm & Log Expense →
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Compliance Disclaimer Footer per SOP §7 */}
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
