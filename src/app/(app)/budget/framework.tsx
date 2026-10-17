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
import {
  DEFAULT_FOUNDER_CATEGORIES,
  fetchActiveFramework,
  saveFramework,
  STANDARD_50_30_20_CATEGORIES,
  validateFrameworkCategories,
} from "../../../lib/budget";
import { BudgetCategory, BudgetFramework } from "../../../types/budget";

export default function BudgetFrameworkScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [frameworkName, setFrameworkName] = useState<string>(
    "Founder's 55/5/10/15/15 Framework",
  );
  const [categories, setCategories] = useState<BudgetCategory[]>(
    DEFAULT_FOUNDER_CATEGORIES,
  );
  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState<string>("3000");

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchActiveFramework(user.id).then((fw) => {
        setFrameworkName(fw.name);
        setCategories(fw.categories);
        if (fw.monthly_income) {
          setMonthlyIncomeStr(String(fw.monthly_income));
        }
        setLoading(false);
      });
    }
  }, [user]);

  const totalPercent = categories.reduce(
    (sum, c) => sum + (Number(c.percent) || 0),
    0,
  );
  const isBalanced = Math.round(totalPercent) === 100;

  const handleSelectPreset = (preset: "founder" | "50_30_20") => {
    if (preset === "founder") {
      setFrameworkName("Founder's 55/5/10/15/15 Framework");
      setCategories(DEFAULT_FOUNDER_CATEGORIES);
    } else {
      setFrameworkName("Standard 50/30/20 Framework");
      setCategories(STANDARD_50_30_20_CATEGORIES);
    }
    setErrorMessage(null);
  };

  const handleCategoryPercentChange = (index: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    const updated = [...categories];
    updated[index] = {
      ...updated[index],
      percent: isNaN(val) ? 0 : val,
    };
    setCategories(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    const parsedIncome = parseFloat(monthlyIncomeStr);
    if (isNaN(parsedIncome) || parsedIncome <= 0) {
      setErrorMessage("Please enter a valid monthly income greater than 0.");
      return;
    }

    const validation = validateFrameworkCategories(categories);
    if (!validation.valid) {
      setErrorMessage(
        validation.error || "Category allocations must total exactly 100%.",
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const frameworkToSave: BudgetFramework = {
      user_id: user.id,
      name: frameworkName,
      categories,
      is_active: true,
      monthly_income: parsedIncome,
    };

    const { error } = await saveFramework(user.id, frameworkToSave);
    if (error) {
      setErrorMessage("Failed to save framework to database: " + error.message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
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
                Framework Setup
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
                Customize Budget Framework
              </Text>
              <Text className="text-sm text-slate-500 mb-6">
                Choose a proven split model or customize your category
                percentages.
              </Text>

              {/* Preset Selector */}
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Framework Presets
              </Text>
              <View className="flex-row space-x-2 mb-6">
                <TouchableOpacity
                  onPress={() => handleSelectPreset("founder")}
                  activeOpacity={0.8}
                  className={`flex-1 p-3.5 rounded-2xl border mr-2 ${
                    frameworkName.includes("55/5/10/15/15")
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Text className="text-xs font-bold text-slate-900 mb-0.5">
                    Founder's 55/5/10/15/15
                  </Text>
                  <Text className="text-[10px] text-slate-500">
                    Signature balanced habit model
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectPreset("50_30_20")}
                  activeOpacity={0.8}
                  className={`flex-1 p-3.5 rounded-2xl border ${
                    frameworkName.includes("50/30/20")
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Text className="text-xs font-bold text-slate-900 mb-0.5">
                    Standard 50/30/20
                  </Text>
                  <Text className="text-[10px] text-slate-500">
                    Needs / Wants / Savings
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Declared Monthly Income */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Declared Monthly Income ($)
                </Text>
                <View className="flex-row items-center px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <Text className="text-lg font-bold text-slate-400 mr-2">
                    $
                  </Text>
                  <TextInput
                    value={monthlyIncomeStr}
                    onChangeText={setMonthlyIncomeStr}
                    placeholder="3000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    className="flex-1 text-lg font-bold text-slate-900"
                  />
                </View>
                <Text className="text-[10px] text-slate-400 mt-1">
                  Used solely to calculate category dollar allocations on your
                  device.
                </Text>
              </View>

              {/* Category Allocation Percentages */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category Allocations
                  </Text>
                  <View
                    className={`px-2.5 py-0.5 rounded-full ${
                      isBalanced ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isBalanced ? "text-emerald-800" : "text-red-700"
                      }`}
                    >
                      Total: {totalPercent}% / 100%
                    </Text>
                  </View>
                </View>

                <View className="space-y-3">
                  {categories.map((cat, idx) => (
                    <View
                      key={cat.id}
                      className="flex-row items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 mb-2"
                    >
                      <View className="flex-row items-center space-x-2 flex-1 pr-3">
                        <Text className="text-base mr-2">{cat.icon}</Text>
                        <Text className="text-xs font-bold text-slate-800 flex-1">
                          {cat.label}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <TextInput
                          value={String(cat.percent)}
                          onChangeText={(val) =>
                            handleCategoryPercentChange(idx, val)
                          }
                          keyboardType="numeric"
                          className="w-14 px-2 py-1.5 text-center font-bold text-sm bg-white rounded-xl border border-slate-300"
                        />
                        <Text className="text-xs font-bold text-slate-500 ml-1.5">
                          %
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {errorMessage && (
                <View className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <Text className="text-xs text-red-700">{errorMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSave}
                disabled={!isBalanced || isSaving}
                activeOpacity={0.85}
                className={`w-full py-4 rounded-2xl items-center justify-center shadow-sm ${
                  !isBalanced || isSaving
                    ? "bg-slate-300"
                    : "bg-emerald-600 active:bg-emerald-700"
                }`}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white uppercase tracking-wider">
                    Save & Activate Framework →
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
