import type {
  SavingsChallenge,
  SavingsChallengeProgress,
  SavingsCheckIn,
  SavingsFrequency,
} from "../types/savings-challenge";

const CHALLENGE_DAYS = 90;

function cadenceDays(frequency: SavingsFrequency): number {
  if (frequency === "daily") return 1;
  if (frequency === "weekly") return 7;
  return 30;
}

function dayNumber(date: string): number {
  return Math.floor(
    Date.parse(`${date.substring(0, 10)}T00:00:00Z`) / 86400000,
  );
}

export function calculateSavingsChallengeProgress(
  challenge: SavingsChallenge,
  checkIns: SavingsCheckIn[],
  today = new Date().toISOString().substring(0, 10),
): SavingsChallengeProgress {
  const elapsedDays = Math.max(
    0,
    dayNumber(today) - dayNumber(challenge.start_date),
  );
  const intervalDays = cadenceDays(challenge.frequency);
  const intervalCount = Math.ceil(CHALLENGE_DAYS / intervalDays);
  const currentInterval = Math.min(
    Math.floor(elapsedDays / intervalDays),
    intervalCount - 1,
  );
  const intervalsWithCheckIns = new Set(
    checkIns.map((checkIn) =>
      Math.floor(
        (dayNumber(checkIn.logged_at) - dayNumber(challenge.start_date)) /
          intervalDays,
      ),
    ),
  );

  let streak = 0;
  for (let interval = currentInterval; interval >= 0; interval -= 1) {
    if (!intervalsWithCheckIns.has(interval)) break;
    streak += 1;
  }

  const totalSaved = checkIns.reduce(
    (total, checkIn) => total + Number(checkIn.amount || 0),
    0,
  );
  const goalAmount = Number(
    (Number(challenge.target_amount) * intervalCount).toFixed(2),
  );

  return {
    day: Math.min(elapsedDays + 1, CHALLENGE_DAYS),
    elapsedDays,
    daysRemaining: Math.max(CHALLENGE_DAYS - elapsedDays, 0),
    totalSaved: Number(totalSaved.toFixed(2)),
    goalAmount,
    percentageComplete:
      goalAmount > 0
        ? Math.min(Math.round((totalSaved / goalAmount) * 100), 100)
        : 0,
    streak,
    isComplete: elapsedDays >= CHALLENGE_DAYS,
  };
}

export function validateSavingsChallenge(
  targetAmount: number,
  vehicleLabel: string,
): string | null {
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return "Enter a target amount greater than zero.";
  }
  if (!vehicleLabel.trim()) {
    return "Enter the savings vehicle you are tracking.";
  }
  return null;
}

export async function fetchActiveSavingsChallenge(userId: string): Promise<{
  challenge: SavingsChallenge | null;
  checkIns: SavingsCheckIn[];
  error: Error | null;
}> {
  try {
    const { supabase } = await import("./supabase");
    const { data: challenge, error } = await supabase
      .from("savings_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error)
      return { challenge: null, checkIns: [], error: new Error(error.message) };
    if (!challenge) return { challenge: null, checkIns: [], error: null };

    const { data: checkIns, error: checkInError } = await supabase
      .from("savings_checkins")
      .select("*")
      .eq("challenge_id", challenge.id)
      .eq("user_id", userId)
      .order("logged_at", { ascending: false });

    if (checkInError) {
      return {
        challenge: challenge as SavingsChallenge,
        checkIns: [],
        error: new Error(checkInError.message),
      };
    }

    return {
      challenge: challenge as SavingsChallenge,
      checkIns: (checkIns || []) as SavingsCheckIn[],
      error: null,
    };
  } catch (error) {
    return {
      challenge: null,
      checkIns: [],
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function createSavingsChallenge(input: {
  userId: string;
  targetAmount: number;
  frequency: SavingsFrequency;
  vehicleLabel: string;
}): Promise<{ data: SavingsChallenge | null; error: Error | null }> {
  const validationError = validateSavingsChallenge(
    input.targetAmount,
    input.vehicleLabel,
  );
  if (validationError) return { data: null, error: new Error(validationError) };

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("savings_challenges")
      .insert({
        user_id: input.userId,
        target_amount: input.targetAmount,
        frequency: input.frequency,
        vehicle_label: input.vehicleLabel.trim(),
        start_date: new Date().toISOString().substring(0, 10),
        status: "active",
      })
      .select()
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as SavingsChallenge, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function createSavingsCheckIn(input: {
  userId: string;
  challengeId: string;
  amount: number;
}): Promise<{ data: SavingsCheckIn | null; error: Error | null }> {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return {
      data: null,
      error: new Error("Enter an amount greater than zero."),
    };
  }

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("savings_checkins")
      .insert({
        user_id: input.userId,
        challenge_id: input.challengeId,
        amount: input.amount,
      })
      .select()
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as SavingsCheckIn, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
