export interface WalkthroughStep {
  step: number;
  targetId: string;
  badge: string;
  title: string;
  description: string;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    step: 1,
    targetId: "curriculum",
    badge: "Step 1 of 4 • Investing 101",
    title: "Start Your First Free Lesson",
    description:
      "Begin with Lesson 1 completely free. Learn the foundational concepts of the Ghana Stock Exchange and US markets with zero jargon.",
  },
  {
    step: 2,
    targetId: "health_meter",
    badge: "Step 2 of 4 • Health Meter",
    title: "Assess Your Financial Health",
    description:
      "Take a short self-reported assessment to understand your savings rate, emergency cushion, and overall financial balance.",
  },
  {
    step: 3,
    targetId: "savings_challenge",
    badge: "Step 3 of 4 • 90-Day Challenge",
    title: "Build a Saving Habit",
    description:
      "Commit to saving any amount on your own schedule toward a vehicle you name yourself. Log check-ins and keep your streak alive.",
  },
  {
    step: 4,
    targetId: "expense_tracker",
    badge: "Step 4 of 4 • Budgeting Tool",
    title: "Track Your Expense Allocations",
    description:
      "Log expenses against the founder's 55/5/10/15/15 framework or customize your own categories. Get clear visual gauges on your spending.",
  },
];

export const WALKTHROUGH_STORAGE_KEY = "kubes_walkthrough_completed_v1";

export function getNextStepIndex(currentIndex: number, totalSteps: number): number {
  if (currentIndex >= totalSteps - 1) return currentIndex;
  return currentIndex + 1;
}

export function getPrevStepIndex(currentIndex: number): number {
  if (currentIndex <= 0) return 0;
  return currentIndex - 1;
}

export function isLastStep(currentIndex: number, totalSteps: number): boolean {
  return currentIndex === totalSteps - 1;
}

// In-memory fallback for Node test environments and SSR
const memoryStorage = new Map<string, string>();

interface SimpleStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

function getStorage(): SimpleStorage {
  try {
    // Dynamic import to prevent bundler / Node test resolution mismatch
    const asyncStorage = require("@react-native-async-storage/async-storage");
    return asyncStorage.default || asyncStorage;
  } catch {
    return {
      getItem: async (key: string) => memoryStorage.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        memoryStorage.set(key, value);
      },
      removeItem: async (key: string) => {
        memoryStorage.delete(key);
      },
    };
  }
}

export async function isWalkthroughCompleted(): Promise<boolean> {
  try {
    const val = await getStorage().getItem(WALKTHROUGH_STORAGE_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

export async function markWalkthroughCompleted(): Promise<void> {
  try {
    await getStorage().setItem(WALKTHROUGH_STORAGE_KEY, "true");
  } catch (err) {
    console.warn("Could not save walkthrough completion status:", err);
  }
}

export async function resetWalkthroughStatus(): Promise<void> {
  try {
    await getStorage().removeItem(WALKTHROUGH_STORAGE_KEY);
  } catch (err) {
    console.warn("Could not reset walkthrough status:", err);
  }
}
