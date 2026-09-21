import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F8F9FB",
        },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
      <Stack.Screen name="onboarding" options={{ title: "Onboarding" }} />
    </Stack>
  );
}
