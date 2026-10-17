import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  SavingsChallenge,
  SavingsCheckIn,
} from "../../types/savings-challenge.ts";
import {
  calculateSavingsChallengeProgress,
  validateSavingsChallenge,
} from "../savings-challenge.ts";

const challenge: SavingsChallenge = {
  id: "challenge-1",
  user_id: "user-1",
  target_amount: 50,
  frequency: "weekly",
  vehicle_label: "Savings account",
  start_date: "2026-10-01",
  status: "active",
};

function checkIn(id: string, loggedAt: string, amount = 50): SavingsCheckIn {
  return {
    id,
    challenge_id: challenge.id,
    user_id: challenge.user_id,
    amount,
    logged_at: `${loggedAt}T12:00:00.000Z`,
  };
}

describe("Savings challenge calculations", () => {
  it("calculates 90-day target, day count, and contribution progress", () => {
    const progress = calculateSavingsChallengeProgress(
      challenge,
      [checkIn("1", "2026-10-08", 75)],
      "2026-10-08",
    );

    assert.equal(progress.day, 8);
    assert.equal(progress.daysRemaining, 83);
    assert.equal(progress.goalAmount, 650);
    assert.equal(progress.totalSaved, 75);
    assert.equal(progress.percentageComplete, 12);
    assert.equal(progress.streak, 1);
    assert.equal(progress.isComplete, false);
  });

  it("counts consecutive contribution periods and resets missed periods", () => {
    const recentStreak = calculateSavingsChallengeProgress(
      challenge,
      [checkIn("1", "2026-10-02"), checkIn("2", "2026-10-09")],
      "2026-10-10",
    );
    const brokenStreak = calculateSavingsChallengeProgress(
      challenge,
      [checkIn("1", "2026-10-02"), checkIn("2", "2026-10-16")],
      "2026-10-17",
    );

    assert.equal(recentStreak.streak, 2);
    assert.equal(brokenStreak.streak, 1);
  });

  it("caps progress and marks the challenge complete after 90 days", () => {
    const progress = calculateSavingsChallengeProgress(
      { ...challenge, frequency: "monthly" },
      [checkIn("1", "2026-10-02", 1000)],
      "2026-12-30",
    );

    assert.equal(progress.day, 90);
    assert.equal(progress.daysRemaining, 0);
    assert.equal(progress.goalAmount, 150);
    assert.equal(progress.percentageComplete, 100);
    assert.equal(progress.isComplete, true);
  });

  it("rejects invalid targets and blank vehicle labels", () => {
    assert.ok(validateSavingsChallenge(0, "Savings account"));
    assert.ok(validateSavingsChallenge(Number.NaN, "Savings account"));
    assert.ok(validateSavingsChallenge(10, "  "));
    assert.equal(validateSavingsChallenge(10, "Savings account"), null);
  });
});
