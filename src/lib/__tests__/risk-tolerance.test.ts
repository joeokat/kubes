import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RISK_QUIZ_QUESTIONS,
  evaluateRiskToleranceScore,
  fetchLatestRiskTolerance,
  saveRiskToleranceResponse,
} from "../risk-tolerance.ts";

describe("Risk Tolerance Engine (PRD §7 & SOP §10)", () => {
  it("defines exactly 5 structured questions with 4 calibrated options each", () => {
    assert.equal(RISK_QUIZ_QUESTIONS.length, 5);

    for (const question of RISK_QUIZ_QUESTIONS) {
      assert.ok(question.title.length > 5);
      assert.ok(question.prompt.length > 10);
      assert.ok(question.contextNote.length > 10);
      assert.equal(question.options.length, 4, `Question ${question.id} must have 4 options`);

      const points = question.options.map((o) => o.points);
      assert.deepEqual(points, [1, 2, 3, 4], `Question ${question.id} options must scale 1 to 4`);
    }
  });

  it("accurately classifies lowest scores (5 to 8) into the Conservative profile", () => {
    // All 1s -> score 5
    const minAnswers = {
      horizon: 1,
      reaction_to_drop: 1,
      primary_goal: 1,
      experience: 1,
      emergency_buffer: 1,
    };
    const evalMin = evaluateRiskToleranceScore(minAnswers);
    assert.equal(evalMin.score, 5);
    assert.equal(evalMin.profileBand, "conservative");
    assert.match(evalMin.profileLabel, /Conservative/);

    // Score 8 boundary
    const boundaryAnswers = {
      horizon: 2,
      reaction_to_drop: 2,
      primary_goal: 2,
      experience: 1,
      emergency_buffer: 1,
    };
    const evalBoundary = evaluateRiskToleranceScore(boundaryAnswers);
    assert.equal(evalBoundary.score, 8);
    assert.equal(evalBoundary.profileBand, "conservative");
  });

  it("accurately classifies mid-range scores (9 to 14) into the Moderate profile", () => {
    // Score 9 boundary
    const answers9 = {
      horizon: 2,
      reaction_to_drop: 2,
      primary_goal: 2,
      experience: 2,
      emergency_buffer: 1,
    };
    const eval9 = evaluateRiskToleranceScore(answers9);
    assert.equal(eval9.score, 9);
    assert.equal(eval9.profileBand, "moderate");
    assert.match(eval9.profileLabel, /Moderate/);

    // Score 14 boundary
    const answers14 = {
      horizon: 3,
      reaction_to_drop: 3,
      primary_goal: 3,
      experience: 3,
      emergency_buffer: 2,
    };
    const eval14 = evaluateRiskToleranceScore(answers14);
    assert.equal(eval14.score, 14);
    assert.equal(eval14.profileBand, "moderate");
  });

  it("accurately classifies higher scores (15 to 20) into the Growth profile", () => {
    // Score 15 boundary
    const answers15 = {
      horizon: 3,
      reaction_to_drop: 3,
      primary_goal: 3,
      experience: 3,
      emergency_buffer: 3,
    };
    const eval15 = evaluateRiskToleranceScore(answers15);
    assert.equal(eval15.score, 15);
    assert.equal(eval15.profileBand, "growth");
    assert.match(eval15.profileLabel, /Growth/);

    // All 4s -> score 20
    const maxAnswers = {
      horizon: 4,
      reaction_to_drop: 4,
      primary_goal: 4,
      experience: 4,
      emergency_buffer: 4,
    };
    const evalMax = evaluateRiskToleranceScore(maxAnswers);
    assert.equal(evalMax.score, 20);
    assert.equal(evalMax.profileBand, "growth");
  });

  it("ensures conceptual asset allocations sum up to exactly 100% across all bands", () => {
    const scores = [5, 11, 18];

    for (const score of scores) {
      const answers = {
        horizon: Math.min(4, Math.ceil(score / 5)),
        reaction_to_drop: Math.min(4, Math.ceil(score / 5)),
        primary_goal: Math.min(4, Math.ceil(score / 5)),
        experience: Math.min(4, Math.ceil(score / 5)),
        emergency_buffer: Math.min(4, Math.ceil(score / 5)),
      };
      const res = evaluateRiskToleranceScore(answers);
      const totalPercent = res.conceptualAllocations.reduce(
        (sum, item) => sum + item.percentage,
        0,
      );
      assert.equal(
        totalPercent,
        100,
        `Allocations for band ${res.profileBand} must sum to 100%`,
      );
    }
  });

  it("gracefully falls back for missing answers to conservative floor", () => {
    const emptyAnswers = {};
    const evalEmpty = evaluateRiskToleranceScore(emptyAnswers);
    assert.equal(evalEmpty.score, 5);
    assert.equal(evalEmpty.profileBand, "conservative");
  });

  it("supports saving and fetching risk tolerance assessment responses", async () => {
    const testUserId = `user-risk-${Date.now()}`;

    // Initially null
    const initial = await fetchLatestRiskTolerance(testUserId);
    assert.equal(initial.data, null);

    const answers = {
      horizon: 3,
      reaction_to_drop: 3,
      primary_goal: 3,
      experience: 2,
      emergency_buffer: 2,
    };
    const evaluation = evaluateRiskToleranceScore(answers);

    const saveRes = await saveRiskToleranceResponse(testUserId, answers, evaluation);
    assert.ok(saveRes.data);
    assert.equal(saveRes.data?.score, 13);
    assert.equal(saveRes.data?.profile_band, "moderate");

    const fetched = await fetchLatestRiskTolerance(testUserId);
    assert.ok(fetched.data);
    assert.equal(fetched.data?.score, 13);
    assert.equal(fetched.data?.profile_band, "moderate");
  });

  it("strictly enforces non-advisory rules and universal educational framing (SOP §7 & §10)", () => {
    const allBands = [
      evaluateRiskToleranceScore({ horizon: 1, reaction_to_drop: 1, primary_goal: 1, experience: 1, emergency_buffer: 1 }),
      evaluateRiskToleranceScore({ horizon: 2, reaction_to_drop: 3, primary_goal: 2, experience: 2, emergency_buffer: 2 }),
      evaluateRiskToleranceScore({ horizon: 4, reaction_to_drop: 4, primary_goal: 4, experience: 4, emergency_buffer: 4 }),
    ];

    for (const b of allBands) {
      const combinedText = [
        b.summary,
        ...b.behavioralCharacteristics,
        ...b.learnerPrinciples,
        ...b.conceptualAllocations.map((a) => a.description),
      ]
        .join(" ")
        .toLowerCase();

      // Zero specific buy/sell recommendations
      assert.doesNotMatch(combinedText, /\bbuy now\b/);
      assert.doesNotMatch(combinedText, /\bsell now\b/);
      assert.doesNotMatch(combinedText, /\btarget price\b/);
      assert.doesNotMatch(combinedText, /\btrading signal\b/);
      assert.doesNotMatch(combinedText, /\bguaranteed profit\b/);
    }
  });
});

