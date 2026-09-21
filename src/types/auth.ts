export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  goal: string | null;
  experience_level: string | null;
  interest_area: string | null;
  onboarding_completed: boolean;
  premium_status: boolean;
  premium_purchased_at: string | null;
  created_at: string;
}

export interface OnboardingData {
  interest_area: string;
  experience_level: string;
  goal: string;
}

export interface AuthState {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
}
