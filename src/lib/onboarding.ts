import type { OnboardingData } from "../types/auth";

export interface QuizOption {
  id: string;
  label: string;
  description: string;
  iconName?: string;
}

export interface QuizStep {
  step: number;
  title: string;
  subtitle: string;
  fieldName: keyof OnboardingData;
  options: QuizOption[];
}

export const ONBOARDING_STEPS: QuizStep[] = [
  {
    step: 1,
    title: "What are you most excited to learn?",
    subtitle: "We'll highlight relevant lessons and content first.",
    fieldName: "interest_area",
    options: [
      {
        id: "gse",
        label: "Ghana Stock Exchange (GSE)",
        description:
          "Local equities, treasury bills, and listed companies in Ghana.",
      },
      {
        id: "us_stocks",
        label: "US Stock Markets",
        description:
          "Global giants, index funds, and long-term US investing principles.",
      },
      {
        id: "budgeting",
        label: "Saving & Budgeting Habits",
        description:
          "Mastering cash flow, expense allocations, and emergency funds.",
      },
      {
        id: "all",
        label: "All of the Above",
        description:
          "A comprehensive journey covering both local and global foundations.",
      },
    ],
  },
  {
    step: 2,
    title: "How would you describe your experience?",
    subtitle: "No prior knowledge is expected or needed.",
    fieldName: "experience_level",
    options: [
      {
        id: "beginner",
        label: "Complete Beginner",
        description:
          "I have never invested before and want clear, step-by-step guidance.",
      },
      {
        id: "curious",
        label: "Curious Saver",
        description:
          "I have some savings and follow the news, but haven't started investing.",
      },
      {
        id: "intermediate",
        label: "Some Experience",
        description:
          "I've tried mutual funds or bought shares, but want structured fundamentals.",
      },
    ],
  },
  {
    step: 3,
    title: "What is your primary financial goal?",
    subtitle: "We'll tailor your dashboard recommendations to this objective.",
    fieldName: "goal",
    options: [
      {
        id: "emergency_habit",
        label: "Build an Emergency Habit",
        description:
          "Establish a reliable savings cushion and consistent budgeting streak.",
      },
      {
        id: "understand_markets",
        label: "Understand How Markets Work",
        description:
          "Demystify vocabulary, compounding returns, and risk management.",
      },
      {
        id: "long_term_wealth",
        label: "Build Long-Term Wealth",
        description:
          "Harness patient compounding through structured diversification.",
      },
      {
        id: "future_readiness",
        label: "Prepare for Major Life Milestones",
        description:
          "Plan strategically for education, home ownership, or family security.",
      },
    ],
  },
];

export function validateStepValue(
  stepNumber: number,
  value: string | undefined | null,
): boolean {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return false;
  }
  const stepConfig = ONBOARDING_STEPS.find((s) => s.step === stepNumber);
  if (!stepConfig) return false;
  return stepConfig.options.some((opt) => opt.id === value);
}

export function validateOnboardingSubmission(data: Partial<OnboardingData>): {
  isValid: boolean;
  errors: Partial<Record<keyof OnboardingData, string>>;
} {
  const errors: Partial<Record<keyof OnboardingData, string>> = {};

  if (!validateStepValue(1, data.interest_area)) {
    errors.interest_area = "Please select an interest area to proceed.";
  }

  if (!validateStepValue(2, data.experience_level)) {
    errors.experience_level = "Please select your experience level.";
  }

  if (!validateStepValue(3, data.goal)) {
    errors.goal = "Please select your primary goal.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
