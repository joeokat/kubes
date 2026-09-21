import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    integrations: [
      Sentry.expoRouterIntegration({
        enableTimeToInitialDisplay: !isRunningInExpoGo(),
      }),
    ],
    enableNativeFramesTracking: !isRunningInExpoGo(),
  });
}

export { Sentry };
