import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/auth";
import "../global.css";
import { initSentry, Sentry } from "../lib/sentry";

initSentry();

function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#F8F9FB",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

export default Sentry.wrap(RootLayout);
