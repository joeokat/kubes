export type SavingsFrequency = "daily" | "weekly" | "monthly";

export interface SavingsChallenge {
  id: string;
  user_id: string;
  target_amount: number;
  frequency: SavingsFrequency;
  vehicle_label: string;
  start_date: string;
  status: string;
  created_at?: string;
}

export interface SavingsCheckIn {
  id: string;
  challenge_id: string;
  user_id: string;
  amount: number;
  logged_at: string;
}

export interface SavingsChallengeProgress {
  day: number;
  elapsedDays: number;
  daysRemaining: number;
  totalSaved: number;
  goalAmount: number;
  percentageComplete: number;
  streak: number;
  isComplete: boolean;
}
