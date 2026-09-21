import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../contexts/auth";

export default function AppLayout() {
  const { user, profile, isLoading, isInitialized } = useAuth();

  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FB]">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (profile && !profile.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F8F9FB",
        },
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
    </Stack>
  );
}
